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
