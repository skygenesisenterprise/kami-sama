import { test } from "node:test";
import assert from "node:assert/strict";
import { PermissionLevel, resolvePermissionLevel, requirePermission } from "../services/permissions.js";
import { PermissionError } from "../services/errors.js";
import { env } from "../config/env.js";

function makeInteraction({ permissions = [], roles = [], userId = "user-1" } = {}) {
  const rolesCache = new Map(roles.map((id) => [id, { id }]));
  return {
    user: { id: userId },
    inCachedGuild: () => true,
    guildId: "guild-1",
    member: {
      roles: { cache: rolesCache },
      permissions: { has: (bit) => permissions.includes(bit) },
    },
  };
}

test("unprivileged member resolves to USER", () => {
  const interaction = makeInteraction();
  assert.equal(resolvePermissionLevel(interaction), PermissionLevel.USER);
});

test("bot owner resolves to BOT_OWNER", () => {
  const previous = env.botOwnerIds;
  env.botOwnerIds = ["owner-1"];
  try {
    const interaction = makeInteraction({ userId: "owner-1" });
    assert.equal(resolvePermissionLevel(interaction), PermissionLevel.BOT_OWNER);
  } finally {
    env.botOwnerIds = previous;
  }
});

test("requirePermission allows sufficient level", () => {
  const previous = env.botOwnerIds;
  env.botOwnerIds = ["owner-1"];
  try {
    const interaction = makeInteraction({ userId: "owner-1" });
    assert.doesNotThrow(() => requirePermission(interaction, PermissionLevel.MODERATOR));
  } finally {
    env.botOwnerIds = previous;
  }
});

test("requirePermission rejects insufficient level", () => {
  const interaction = makeInteraction();
  assert.throws(
    () => requirePermission(interaction, PermissionLevel.ADMIN),
    PermissionError
  );
});
