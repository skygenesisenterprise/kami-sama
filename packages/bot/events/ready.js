import { logger } from "../services/logger.js";
import { announceDeployment } from "../services/deployment-service.js";
import { applyPresence } from "../services/presence.js";

export const name = "clientReady";
export const once = true;

export async function execute(client) {
  applyPresence(client);

  logger.info(`Bot connecté en tant que ${client.user.tag}`);
  logger.info("Presence applied", { customStatus: client.user.presence.activities?.[0]?.state ?? "" });

  await announceDeployment(client).catch((error) => logger.error("Deployment announce failed", { error: error.message }));
}
