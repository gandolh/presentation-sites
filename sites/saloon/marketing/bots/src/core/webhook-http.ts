/**
 * HTTP webhook server + Meta payload parsing — real-impl glue.
 *
 * Opens an HTTP listener (node:http) that:
 *  - GET  {basePath}/webhook  -> Meta subscription handshake (hub.challenge)
 *  - POST {basePath}/webhook  -> verify X-Hub-Signature-256, parse INBOUND
 *                                `messages` events, dispatch via the router.
 *
 * INBOUND-ONLY: we parse only message events. `comments`/engagement payloads are
 * ignored by construction (COMPLIANCE #3). Runs only outside mock mode.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { Logger } from "./logger.ts";
import type { Config } from "./config.ts";
import type { InboundMessage, Platform } from "./types.ts";
import { verifyMetaSignature, verifySubscription } from "./webhook.ts";

/** What the HTTP server needs: a way to dispatch a parsed inbound message. */
export interface Dispatcher {
  dispatch(msg: InboundMessage): Promise<void>;
}

/** Read the full request body as a UTF-8 string (needed for signature check). */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/**
 * Parse a Meta webhook payload into InboundMessage[]. Supports WhatsApp Cloud
 * (`object: "whatsapp_business_account"`) and Messenger/Instagram messaging.
 * Returns only user-sent messages (skips echoes, statuses, comments).
 */
export function parseMetaInbound(payload: unknown): InboundMessage[] {
  const out: InboundMessage[] = [];
  const root = payload as { object?: string; entry?: unknown[] };
  if (!root || !Array.isArray(root.entry)) return out;

  const isWhatsApp = root.object === "whatsapp_business_account";

  for (const entryRaw of root.entry) {
    const entry = entryRaw as {
      messaging?: unknown[];
      changes?: { value?: { messages?: unknown[]; metadata?: unknown } }[];
    };

    // WhatsApp: entry.changes[].value.messages[]
    if (isWhatsApp && Array.isArray(entry.changes)) {
      for (const change of entry.changes) {
        const messages = change.value?.messages;
        if (!Array.isArray(messages)) continue;
        for (const mRaw of messages) {
          const m = mRaw as { from?: string; text?: { body?: string }; timestamp?: string; type?: string };
          if (m.type !== "text" || !m.from) continue;
          out.push({
            platform: "whatsapp",
            fromId: m.from,
            text: m.text?.body ?? "",
            timestampMs: m.timestamp ? Number(m.timestamp) * 1000 : Date.now(),
            withinServiceWindow: true, // an inbound message opens/holds the 24h window
            raw: mRaw,
          });
        }
      }
    }

    // Messenger / Instagram: entry.messaging[]
    if (Array.isArray(entry.messaging)) {
      const platform: Platform = root.object === "instagram" ? "instagram" : "facebook";
      for (const evRaw of entry.messaging) {
        const ev = evRaw as {
          sender?: { id?: string };
          message?: { text?: string; is_echo?: boolean };
          timestamp?: number;
        };
        // Skip echoes (our own outbound) and non-text events.
        if (!ev.message || ev.message.is_echo || typeof ev.message.text !== "string") continue;
        if (!ev.sender?.id) continue;
        out.push({
          platform,
          fromId: ev.sender.id,
          text: ev.message.text,
          timestampMs: ev.timestamp ?? Date.now(),
          withinServiceWindow: true,
          raw: evRaw,
        });
      }
    }
  }
  return out;
}

/**
 * Start the webhook HTTP server. Returns the node http.Server so the caller can
 * close it. Requires META_APP_SECRET + META_VERIFY_TOKEN (validated upstream by
 * assertSecretsForLive).
 */
export function startWebhookServer(
  config: Config,
  dispatcher: Dispatcher,
  log: Logger,
): ReturnType<typeof createServer> {
  const path = `${config.basePath}/webhook`;
  const appSecret = config.secrets.metaAppSecret ?? "";
  const verifyToken = config.secrets.metaVerifyToken ?? "";

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    void handle(req, res).catch((err) => {
      log.error("webhook handler error", { err: String(err) });
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const reqUrl = new URL(req.url ?? "/", "http://localhost");
    if (reqUrl.pathname !== path) {
      res.writeHead(404);
      res.end();
      return;
    }

    // GET: subscription handshake.
    if (req.method === "GET") {
      const query: { mode?: string; token?: string; challenge?: string } = {};
      const mode = reqUrl.searchParams.get("hub.mode");
      const token = reqUrl.searchParams.get("hub.verify_token");
      const challengeParam = reqUrl.searchParams.get("hub.challenge");
      if (mode !== null) query.mode = mode;
      if (token !== null) query.token = token;
      if (challengeParam !== null) query.challenge = challengeParam;
      const challenge = verifySubscription(query, verifyToken);
      if (challenge === null) {
        res.writeHead(403);
        res.end();
        return;
      }
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(challenge);
      return;
    }

    // POST: verified inbound events.
    if (req.method === "POST") {
      const body = await readBody(req);
      const sig = req.headers["x-hub-signature-256"];
      if (!verifyMetaSignature(body, Array.isArray(sig) ? sig[0] : sig, appSecret)) {
        log.warn("webhook signature invalid — rejected");
        res.writeHead(401);
        res.end();
        return;
      }
      // Always 200 fast so Meta doesn't retry; process after responding.
      res.writeHead(200);
      res.end();

      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        log.warn("webhook body not JSON");
        return;
      }
      for (const msg of parseMetaInbound(payload)) {
        await dispatcher.dispatch(msg);
      }
      return;
    }

    res.writeHead(405);
    res.end();
  }

  server.listen(config.port, () => {
    log.info("webhook server listening", { port: config.port, path });
  });
  return server;
}
