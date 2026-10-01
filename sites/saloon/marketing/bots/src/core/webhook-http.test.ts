/**
 * Tests for parseMetaInbound — the Meta webhook payload -> InboundMessage[]
 * parser. Pure function, no network. Verifies WhatsApp + Messenger/IG shapes
 * and that non-message / echo / comment events are ignored (INBOUND-ONLY).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { parseMetaInbound } from "./webhook-http.ts";

test("parses a WhatsApp inbound text message", () => {
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                { from: "40755123456", type: "text", text: { body: "Programare" }, timestamp: "1700000000" },
              ],
            },
          },
        ],
      },
    ],
  };
  const msgs = parseMetaInbound(payload);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0]?.platform, "whatsapp");
  assert.equal(msgs[0]?.fromId, "40755123456");
  assert.equal(msgs[0]?.text, "Programare");
  assert.equal(msgs[0]?.withinServiceWindow, true);
});

test("skips non-text WhatsApp messages (e.g. status/media without text)", () => {
  const payload = {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ value: { messages: [{ from: "40755123456", type: "image" }] } }] }],
  };
  assert.equal(parseMetaInbound(payload).length, 0);
});

test("parses an Instagram messaging event", () => {
  const payload = {
    object: "instagram",
    entry: [
      {
        messaging: [
          { sender: { id: "ig_123" }, message: { text: "Bună" }, timestamp: 1700000000000 },
        ],
      },
    ],
  };
  const msgs = parseMetaInbound(payload);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0]?.platform, "instagram");
  assert.equal(msgs[0]?.fromId, "ig_123");
});

test("ignores echo messages (our own outbound) on Messenger", () => {
  const payload = {
    object: "page",
    entry: [
      {
        messaging: [
          { sender: { id: "page" }, message: { text: "auto-reply", is_echo: true }, timestamp: 1 },
        ],
      },
    ],
  };
  assert.equal(parseMetaInbound(payload).length, 0);
});

test("returns empty for malformed / comment / unrelated payloads", () => {
  assert.deepEqual(parseMetaInbound(null), []);
  assert.deepEqual(parseMetaInbound({}), []);
  assert.deepEqual(parseMetaInbound({ object: "page", entry: [{}] }), []);
  // A comment-change payload has no `messages` / `messaging` -> nothing parsed.
  assert.deepEqual(
    parseMetaInbound({ object: "instagram", entry: [{ changes: [{ value: { comments: [{}] } }] }] }),
    [],
  );
});

// ── The HTTP server itself ───────────────────────────────────────────────────
//
// Started for real on port 0 with a stub dispatcher, so these exercise the body
// cap, the signature check and the dispatch in the order the server runs them.

import { createHmac } from "node:crypto";
import { request } from "node:http";
import type { AddressInfo } from "node:net";

import { loadConfig } from "./config.ts";
import { createLogger } from "./logger.ts";
import { startWebhookServer } from "./webhook-http.ts";
import type { InboundMessage } from "./types.ts";

const SECRET = "test-app-secret";

async function withServer(run: (port: number, dispatched: InboundMessage[]) => Promise<void>) {
  const config = loadConfig({ PORT: "0", BASE_PATH: "/bots", META_APP_SECRET: SECRET, META_VERIFY_TOKEN: "t" });
  const dispatched: InboundMessage[] = [];
  const server = startWebhookServer(config, { dispatch: async (m) => void dispatched.push(m) }, createLogger("error"));
  await new Promise<void>((resolve) => (server.listening ? resolve() : server.once("listening", () => resolve())));
  try {
    await run((server.address() as AddressInfo).port, dispatched);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

/** POST a body, optionally streamed in chunks without a content-length. */
function post(
  port: number,
  body: string | Buffer[],
  headers: Record<string, string> = {},
): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = request({ port, method: "POST", path: "/bots/webhook", headers }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    // The server drops the connection after a 413; a write racing that is fine.
    req.on("error", (err) => (req.writableEnded ? undefined : reject(err)));
    if (typeof body === "string") {
      req.end(body);
      return;
    }
    let i = 0;
    const pump = () => {
      while (i < body.length) {
        if (req.destroyed) return;
        if (!req.write(body[i++])) return void req.once("drain", pump);
      }
      req.end();
    };
    pump();
  });
}

const sign = (body: string) => `sha256=${createHmac("sha256", SECRET).update(body).digest("hex")}`;

const signedMessage = JSON.stringify({
  object: "whatsapp_business_account",
  entry: [{ changes: [{ value: { messages: [{ from: "40755123456", type: "text", text: { body: "Programare" } }] } }] }],
});

test("server: a correctly signed small body gets 200 and is dispatched", async () => {
  await withServer(async (port, dispatched) => {
    const status = await post(port, signedMessage, { "x-hub-signature-256": sign(signedMessage) });
    assert.equal(status, 200);
    await new Promise((r) => setTimeout(r, 50)); // dispatch runs after the 200
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.text, "Programare");
  });
});

test("server: a bad signature still gets 401 and is not dispatched", async () => {
  await withServer(async (port, dispatched) => {
    const status = await post(port, signedMessage, { "x-hub-signature-256": sign("something else") });
    assert.equal(status, 401);
    assert.equal(dispatched.length, 0);
  });
});

test("server: a declared oversized body gets 413 before any of it is read", async () => {
  await withServer(async (port, dispatched) => {
    const big = "x".repeat(2 * 1024 * 1024);
    const status = await post(port, big, { "x-hub-signature-256": sign(big) });
    assert.equal(status, 413);
    assert.equal(dispatched.length, 0);
  });
});

test("server: a streamed oversized body (no content-length) gets 413 and is not dispatched", async () => {
  await withServer(async (port, dispatched) => {
    const chunk = Buffer.alloc(64 * 1024, "x");
    const status = await post(port, Array.from({ length: 64 }, () => chunk), {
      "transfer-encoding": "chunked",
      "x-hub-signature-256": "sha256=00",
    });
    assert.equal(status, 413);
    assert.equal(dispatched.length, 0);
  });
});
