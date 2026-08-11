import { env } from "../config/env.js";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[env.logLevel] ?? LEVELS.info;

function timestamp() {
  return new Date().toISOString();
}

function write(level, message, extra) {
  if ((LEVELS[level] ?? 20) < threshold) return;
  const line = {
    ts: timestamp(),
    level,
    msg: message,
    ...extra,
  };
  const stream = level === "error" || level === "warn" ? process.stderr : process.stdout;
  stream.write(`${JSON.stringify(line)}\n`);
}

export const logger = {
  debug: (message, extra) => write("debug", message, extra),
  info: (message, extra) => write("info", message, extra),
  warn: (message, extra) => write("warn", message, extra),
  error: (message, extra) => write("error", message, extra),

  child(context) {
    return {
      debug: (message, extra) => write("debug", message, { ...context, ...extra }),
      info: (message, extra) => write("info", message, { ...context, ...extra }),
      warn: (message, extra) => write("warn", message, { ...context, ...extra }),
      error: (message, extra) => write("error", message, { ...context, ...extra }),
    };
  },
};
