/**
 * Structured logger + PII redaction — FROZEN (Phase 1).
 *
 * COMPLIANCE: never log message bodies or PII beyond necessity (rule #12).
 * Use `redact()` on any phone number / handle before logging.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  /** Returns a logger that prefixes every line with a scope (e.g. bot name). */
  child(scope: string): Logger;
}

/**
 * Redact a phone number / id for logs: keep last 3 chars only.
 * "40700000123" -> "********123". Returns "***" for short/empty input.
 */
export function redact(value: string | undefined | null): string {
  if (!value) return "***";
  if (value.length <= 3) return "***";
  return "*".repeat(value.length - 3) + value.slice(-3);
}

const order: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export function createLogger(minLevel: LogLevel = "info", scope = ""): Logger {
  const emit = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (order[level] < order[minLevel]) return;
    const line = {
      level,
      scope: scope || undefined,
      msg,
      ...(meta ?? {}),
    };
    // Single-line JSON keeps logs grep-able and avoids accidental PII sprawl.
    const sink = level === "error" || level === "warn" ? console.error : console.log;
    sink(JSON.stringify(line));
  };

  return {
    debug: (m, meta) => emit("debug", m, meta),
    info: (m, meta) => emit("info", m, meta),
    warn: (m, meta) => emit("warn", m, meta),
    error: (m, meta) => emit("error", m, meta),
    child: (childScope) =>
      createLogger(minLevel, scope ? `${scope}:${childScope}` : childScope),
  };
}
