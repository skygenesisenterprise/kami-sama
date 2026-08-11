import { logger } from "./logger.js";

/**
 * Application error hierarchy. Every error thrown by bot code should be an
 * AppError (or subclass) so the central handler can decide how to respond
 * without ever leaking internals to users.
 */
export class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.userMessage = options.userMessage ?? message;
    this.code = options.code ?? "APP_ERROR";
    this.status = options.status;
    this.details = options.details;
    this.requestId = options.requestId;
    this.cause = options.cause;
    this.loggable = options.loggable ?? true;
  }
}

export class UserError extends AppError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? "USER_ERROR", loggable: false });
  }
}

export class PermissionError extends AppError {
  constructor(message = "Vous n'avez pas la permission d'utiliser cette commande.") {
    super(message, { code: "PERMISSION_DENIED", loggable: false });
  }
}

export class FeatureDisabledError extends AppError {
  constructor(feature) {
    super(`La fonctionnalité **${feature}** est désactivée.`, {
      code: "FEATURE_DISABLED",
      loggable: false,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterMs) {
    super("Trop de requêtes. Réessayez dans quelques instants.", {
      code: "RATE_LIMITED",
      loggable: false,
      details: { retryAfterMs },
    });
  }
}

export class ApiError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      ...options,
      code: options.code ?? "KAMI_API_ERROR",
      userMessage: options.userMessage ?? "Impossible de contacter Kami-Sama actuellement. Réessayez dans quelques instants.",
    });
    this.endpoint = options.endpoint;
  }
}

export function isUserFacing(error) {
  return error instanceof AppError && !error.loggable;
}

export function reportError(context, error) {
  if (error instanceof AppError && !error.loggable) {
    return;
  }
  const extra = {
    error: error instanceof Error ? error.stack ?? error.message : String(error),
  };
  if (error instanceof ApiError) {
    extra.endpoint = error.endpoint;
    extra.status = error.status;
    extra.code = error.code;
    extra.requestId = error.requestId;
  }
  logger.error(`${context}: ${error?.message ?? error}`, extra);
}
