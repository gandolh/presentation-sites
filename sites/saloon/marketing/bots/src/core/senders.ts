/**
 * Outbound API interfaces + mock factory — FROZEN (Phase 1).
 *
 * Phase 2 bots code against THESE INTERFACES only. There is no real HTTP here;
 * real impls (WhatsApp Cloud API, Meta Messaging/Marketing/Content Publishing,
 * TikTok APIs) are a later task and must satisfy the same interfaces.
 *
 * COMPLIANCE: official APIs only (#1), inbound-reply only (#3), 24h window (#4),
 * campaigns prepared PAUSED for human approval (#6), spend kill-switch (#8).
 */

import type {
  OutboundMessage,
  ScheduledPost,
  CampaignDraft,
  Platform,
} from "./types.ts";

/** WhatsApp Cloud API — replies + utility/marketing templates. */
export interface WhatsAppSender {
  /** Reply inside the 24h service window (free-form). */
  sendMessage(msg: OutboundMessage): Promise<{ ok: boolean; externalId?: string }>;
  /** Send a pre-approved template (used outside the window / for reminders). */
  sendTemplate(
    toId: string,
    templateName: string,
    params: Record<string, string>,
  ): Promise<{ ok: boolean; externalId?: string }>;
}

/** Meta Messenger / Instagram Messaging — inbound-reply only. */
export interface MetaMessagingSender {
  sendReply(msg: OutboundMessage): Promise<{ ok: boolean; externalId?: string }>;
  /** Configure the FAQ ice-breaker / quick-reply menu (reply menu only). */
  setIceBreakers(platform: Platform, items: { question: string; payload: string }[]): Promise<void>;
}

/** IG/FB Content Publishing + TikTok Content Posting. */
export interface ContentPublisher {
  /**
   * Publish one post to one platform. The IG create->poll->publish dance is the
   * impl's concern; the bot just awaits a result.
   */
  publish(post: ScheduledPost, target: Platform): Promise<{ ok: boolean; externalId?: string; error?: string }>;
}

/** Meta Marketing API + TikTok Marketing API — prepares PAUSED drafts only. */
export interface MarketingClient {
  /**
   * Create the campaign as PAUSED. MUST refuse to create ACTIVE campaigns.
   * Returns the platform draft id.
   */
  createPausedCampaign(draft: CampaignDraft): Promise<{ ok: boolean; draftId?: string; error?: string }>;
  /** Pause an existing campaign (safe — stops spend; no approval needed). */
  pauseCampaign(externalId: string): Promise<{ ok: boolean }>;
  /** Pull spend/results for the weekly report. */
  getInsights(externalId: string): Promise<{ spendMinor: number; results: number }>;
}

/** Notifications to a human (campaign approval, health alerts). */
export interface Notifier {
  notify(subject: string, body: string): Promise<void>;
}

/** Bundle handed to every bot via CoreDeps. */
export interface Senders {
  whatsapp: WhatsAppSender;
  meta: MetaMessagingSender;
  publisher: ContentPublisher;
  marketing: MarketingClient;
  notifier: Notifier;
}

/** A record of everything the mocks "sent" — Phase 2 tests assert against this. */
export interface SentLog {
  whatsappMessages: OutboundMessage[];
  whatsappTemplates: { toId: string; templateName: string; params: Record<string, string> }[];
  metaReplies: OutboundMessage[];
  iceBreakers: { platform: Platform; items: { question: string; payload: string }[] }[];
  published: { post: ScheduledPost; target: Platform }[];
  campaignDrafts: CampaignDraft[];
  pausedCampaigns: string[];
  notifications: { subject: string; body: string }[];
}

/**
 * Offline mock senders. No network. Records everything into `log` so tests can
 * assert what a bot tried to send. `createMockSenders` is the seam Phase 2 +
 * the shared-tests harness build on.
 */
export function createMockSenders(): { senders: Senders; log: SentLog } {
  const log: SentLog = {
    whatsappMessages: [],
    whatsappTemplates: [],
    metaReplies: [],
    iceBreakers: [],
    published: [],
    campaignDrafts: [],
    pausedCampaigns: [],
    notifications: [],
  };

  let counter = 0;
  const nextId = (prefix: string) => `${prefix}_${++counter}`;

  const senders: Senders = {
    whatsapp: {
      async sendMessage(msg) {
        log.whatsappMessages.push(msg);
        return { ok: true, externalId: nextId("wa") };
      },
      async sendTemplate(toId, templateName, params) {
        log.whatsappTemplates.push({ toId, templateName, params });
        return { ok: true, externalId: nextId("wat") };
      },
    },
    meta: {
      async sendReply(msg) {
        log.metaReplies.push(msg);
        return { ok: true, externalId: nextId("meta") };
      },
      async setIceBreakers(platform, items) {
        log.iceBreakers.push({ platform, items });
      },
    },
    publisher: {
      async publish(post, target) {
        log.published.push({ post, target });
        return { ok: true, externalId: nextId("pub") };
      },
    },
    marketing: {
      async createPausedCampaign(draft) {
        if (draft.status !== "PAUSED") {
          return { ok: false, error: "refused: campaign must be PAUSED" };
        }
        log.campaignDrafts.push(draft);
        return { ok: true, draftId: nextId("camp") };
      },
      async pauseCampaign(externalId) {
        log.pausedCampaigns.push(externalId);
        return { ok: true };
      },
      async getInsights() {
        return { spendMinor: 0, results: 0 };
      },
    },
    notifier: {
      async notify(subject, body) {
        log.notifications.push({ subject, body });
      },
    },
  };

  return { senders, log };
}
