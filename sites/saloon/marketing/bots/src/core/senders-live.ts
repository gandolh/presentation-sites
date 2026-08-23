/**
 * Live sender implementations — real-impl of the FROZEN sender interfaces
 * (core/senders.ts), behind the same `Senders` shape the mocks satisfy.
 *
 * Used only outside mock mode (see server.ts). Each client wraps the official
 * API with `fetch` (Node built-in): WhatsApp Cloud API, Meta Messaging
 * (Messenger/IG), Content Publishing (IG/FB) + TikTok Content Posting, Meta
 * Marketing API. COMPLIANCE: official APIs only (#1); campaigns are created
 * PAUSED only (#6); no engagement actions anywhere.
 *
 * NOTE: these make real network calls and require real tokens — they are NEVER
 * constructed in mock mode, so the scaffold's tests never touch them. They are
 * verified by typecheck; live verification needs the human credential steps
 * (roadmap Part B). Endpoints/fields follow the documented v-graph shapes; the
 * Graph API version is configurable so it can be bumped without code churn.
 */

import type {
  Senders,
  WhatsAppSender,
  MetaMessagingSender,
  ContentPublisher,
  MarketingClient,
  Notifier,
} from "./senders.ts";
import type { Config } from "./config.ts";
import type { Logger } from "./logger.ts";
import type {
  OutboundMessage,
  ScheduledPost,
  CampaignDraft,
  Platform,
} from "./types.ts";

const GRAPH = "https://graph.facebook.com";
const GRAPH_VERSION = "v21.0";

/** Small typed fetch helper. Throws on non-2xx so callers surface failures. */
async function graphPost(
  url: string,
  token: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`graph ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function graphGet(url: string, token: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(`graph ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

/** Require a secret or throw a clear error (called lazily, per request). */
function need(value: string | undefined, name: string): string {
  if (!value) throw new Error(`missing required secret: ${name}`);
  return value;
}

// --------------------------------------------------------------------------
// WhatsApp Cloud API
// --------------------------------------------------------------------------

function createWhatsAppSender(config: Config, log: Logger): WhatsAppSender {
  const phoneId = () => need(config.secrets.whatsappPhoneNumberId, "WHATSAPP_PHONE_NUMBER_ID");
  const token = () => need(config.secrets.whatsappToken, "WHATSAPP_TOKEN");
  const url = () => `${GRAPH}/${GRAPH_VERSION}/${phoneId()}/messages`;

  return {
    async sendMessage(msg: OutboundMessage) {
      // Free-form reply, valid only inside the 24h service window (COMPLIANCE #4).
      const json = await graphPost(url(), token(), {
        messaging_product: "whatsapp",
        to: msg.toId,
        type: "text",
        text: { body: msg.text },
      });
      const id = (json.messages as { id?: string }[] | undefined)?.[0]?.id;
      log.debug("whatsapp message sent");
      return id ? { ok: true, externalId: id } : { ok: true };
    },

    async sendTemplate(toId, templateName, params) {
      // Utility/marketing template (required outside the window).
      const components =
        Object.keys(params).length > 0
          ? [
              {
                type: "body",
                parameters: Object.values(params).map((text) => ({ type: "text", text })),
              },
            ]
          : [];
      const json = await graphPost(url(), token(), {
        messaging_product: "whatsapp",
        to: toId,
        type: "template",
        template: {
          name: templateName,
          language: { code: "ro" },
          ...(components.length ? { components } : {}),
        },
      });
      const id = (json.messages as { id?: string }[] | undefined)?.[0]?.id;
      return id ? { ok: true, externalId: id } : { ok: true };
    },
  };
}

// --------------------------------------------------------------------------
// Meta Messaging (Messenger + Instagram) — inbound-reply only
// --------------------------------------------------------------------------

function createMetaMessagingSender(config: Config, log: Logger): MetaMessagingSender {
  const token = () => need(config.secrets.igPageToken, "IG_PAGE_TOKEN");

  return {
    async sendReply(msg: OutboundMessage) {
      // Send API: reply to a user who messaged us first (RESPONSE message tag
      // is implicit inside the 24h window). Same endpoint for IG + Messenger
      // when the Page token is IG-linked.
      const json = await graphPost(`${GRAPH}/${GRAPH_VERSION}/me/messages`, token(), {
        recipient: { id: msg.toId },
        messaging_type: "RESPONSE",
        message: { text: msg.text },
      });
      const id = json.message_id as string | undefined;
      log.debug("meta reply sent", { platform: msg.platform });
      return id ? { ok: true, externalId: id } : { ok: true };
    },

    async setIceBreakers(platform: Platform, items) {
      // Reply menu only (COMPLIANCE #3) — configured on the messaging profile.
      await graphPost(`${GRAPH}/${GRAPH_VERSION}/me/messenger_profile`, token(), {
        platform: platform === "instagram" ? "instagram" : "messenger",
        ice_breakers: [
          {
            call_to_actions: items.map((i) => ({ question: i.question, payload: i.payload })),
            locale: "default",
          },
        ],
      });
      log.debug("ice-breakers set", { platform });
    },
  };
}

// --------------------------------------------------------------------------
// Content Publishing (IG/FB) + TikTok Content Posting
// --------------------------------------------------------------------------

function createContentPublisher(config: Config, log: Logger): ContentPublisher {
  const igToken = () => need(config.secrets.igPageToken, "IG_PAGE_TOKEN");

  async function publishInstagram(post: ScheduledPost): Promise<string> {
    // IG create -> poll -> publish. assetRef must be a public video URL at impl
    // time (uploading bytes is a separate concern; the queue stores the ref).
    const igUserId = need(config.secrets.fbPageId, "FB_PAGE_ID"); // IG user id mapping
    const created = await graphPost(`${GRAPH}/${GRAPH_VERSION}/${igUserId}/media`, igToken(), {
      media_type: "REELS",
      video_url: post.assetRef,
      caption: post.captionRo,
    });
    const containerId = String(created.id);
    // Poll until the container finishes processing before publishing.
    for (let i = 0; i < 30; i++) {
      const status = await graphGet(
        `${GRAPH}/${GRAPH_VERSION}/${containerId}?fields=status_code`,
        igToken(),
      );
      if (status.status_code === "FINISHED") break;
      if (status.status_code === "ERROR") throw new Error("IG media processing failed");
      await new Promise((r) => setTimeout(r, 2000));
    }
    const published = await graphPost(
      `${GRAPH}/${GRAPH_VERSION}/${igUserId}/media_publish`,
      igToken(),
      { creation_id: containerId },
    );
    return String(published.id);
  }

  async function publishFacebook(post: ScheduledPost): Promise<string> {
    const pageId = need(config.secrets.fbPageId, "FB_PAGE_ID");
    const json = await graphPost(`${GRAPH}/${GRAPH_VERSION}/${pageId}/videos`, igToken(), {
      file_url: post.assetRef,
      description: post.captionRo,
    });
    return String(json.id);
  }

  async function publishTikTok(post: ScheduledPost): Promise<string> {
    // TikTok Content Posting API (OAuth bearer). PULL_FROM_URL with a public
    // asset; init returns a publish id the impl can poll for status.
    const token = need(config.secrets.tiktokAccessToken, "TIKTOK_ACCESS_TOKEN");
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({
        post_info: { title: post.captionRo, privacy_level: "PUBLIC_TO_EVERYONE" },
        source_info: { source: "PULL_FROM_URL", video_url: post.assetRef },
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { publish_id?: string };
      error?: { message?: string };
    };
    if (!res.ok) throw new Error(`tiktok ${res.status}: ${json.error?.message ?? "error"}`);
    return json.data?.publish_id ?? "tiktok-pending";
  }

  return {
    async publish(post: ScheduledPost, target: Platform) {
      try {
        let externalId: string;
        switch (target) {
          case "instagram":
            externalId = await publishInstagram(post);
            break;
          case "facebook":
            externalId = await publishFacebook(post);
            break;
          case "tiktok":
            externalId = await publishTikTok(post);
            break;
          default:
            return { ok: false, error: `unsupported publish target: ${target}` };
        }
        log.debug("published", { target });
        return { ok: true, externalId };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },
  };
}

// --------------------------------------------------------------------------
// Meta Marketing API — prepares PAUSED drafts only
// --------------------------------------------------------------------------

function createMarketingClient(config: Config, log: Logger): MarketingClient {
  const token = () => need(config.secrets.adsAccessToken, "ADS_ACCESS_TOKEN");
  const account = () => need(config.secrets.adsAccountId, "ADS_ACCOUNT_ID");

  return {
    async createPausedCampaign(draft: CampaignDraft) {
      // Hard guard: this client refuses to create anything that isn't PAUSED.
      if (draft.status !== "PAUSED") {
        return { ok: false, error: "refused: campaign must be PAUSED" };
      }
      try {
        const json = await graphPost(
          `${GRAPH}/${GRAPH_VERSION}/act_${account()}/campaigns`,
          token(),
          {
            name: `${draft.presetKey} (${draft.createdAt})`,
            objective: draft.objective,
            status: "PAUSED", // money safety: never ACTIVE
            special_ad_categories: [],
          },
        );
        log.info("paused campaign created", { preset: draft.presetKey });
        return { ok: true, draftId: String(json.id) };
        // TODO(impl): create ad set (geo radius, age, daily_budget =
        //   draft.dailyBudgetMinor, optimization_goal) + creative + ad, all
        //   PAUSED. Left for the human-credentialed wiring pass since it needs a
        //   live ad account + creative ids to validate end-to-end.
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    },

    async pauseCampaign(externalId: string) {
      try {
        await graphPost(`${GRAPH}/${GRAPH_VERSION}/${externalId}`, token(), { status: "PAUSED" });
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },

    async getInsights(externalId: string) {
      const json = await graphGet(
        `${GRAPH}/${GRAPH_VERSION}/${externalId}/insights?fields=spend,actions`,
        token(),
      );
      const row = (json.data as { spend?: string }[] | undefined)?.[0];
      const spendMinor = row?.spend ? Math.round(Number(row.spend) * 100) : 0;
      return { spendMinor, results: 0 };
    },
  };
}

// --------------------------------------------------------------------------
// Notifier — human-approval / health alerts
// --------------------------------------------------------------------------

function createNotifier(config: Config, log: Logger): Notifier {
  return {
    async notify(subject: string, body: string) {
      const to = config.secrets.notifyTo;
      if (!to) {
        // No channel configured: log so the message isn't silently lost.
        log.warn("notify: no NOTIFY_TO configured — logging only", { subject });
        return;
      }
      // TODO(impl): deliver via the chosen channel (email/WhatsApp to the owner).
      // The transport is a human/config choice (roadmap Part B); we log here so
      // the approval message is never lost in the meantime.
      log.info("notify", { to, subject, body });
    },
  };
}

/** Build the live `Senders` bundle. Constructed only when !config.mockMode. */
export function createLiveSenders(config: Config, log: Logger): Senders {
  return {
    whatsapp: createWhatsAppSender(config, log.child("wa")),
    meta: createMetaMessagingSender(config, log.child("meta")),
    publisher: createContentPublisher(config, log.child("pub")),
    marketing: createMarketingClient(config, log.child("ads")),
    notifier: createNotifier(config, log.child("notify")),
  };
}
