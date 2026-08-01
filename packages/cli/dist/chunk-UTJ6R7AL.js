// src/config/index.ts
import Conf from "conf";
import { z } from "zod";
function getDefaultServerUrl() {
  if (process.env.KAMI_API_URL) return process.env.KAMI_API_URL;
  const env = process.env.KAMI_ENV;
  if (env === "prod" || env === "production") return "https://api.kami-sama.tv";
  if (env === "dev" || env === "development") return "http://api.kami-sama.localhost";
  return "http://api.kami-sama.localhost";
}
var ConfigSchema = z.object({
  serverUrl: z.string().default(getDefaultServerUrl()),
  token: z.string().nullable().default(null),
  refreshToken: z.string().nullable().default(null),
  workspaceId: z.string().nullable().default(null),
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string(),
    roles: z.array(z.string()).default([])
  }).nullable().default(null),
  outputFormat: z.enum(["table", "json", "yaml"]).default("table")
});
var store = new Conf({
  projectName: "kami-cli",
  defaults: {
    serverUrl: getDefaultServerUrl(),
    token: null,
    refreshToken: null,
    workspaceId: null,
    user: null,
    outputFormat: "table"
  }
});
function getConfig() {
  return store.store;
}
function setConfig(updates) {
  const current = store.store;
  store.store = { ...current, ...updates };
}
function getServerUrl() {
  return store.get("serverUrl");
}
function setServerUrl(url) {
  store.set("serverUrl", url);
}
function getToken() {
  return store.get("token");
}
function setToken(token) {
  store.set("token", token);
}
function setRefreshToken(token) {
  store.set("refreshToken", token);
}
function getUser() {
  return store.get("user");
}
function setUser(user) {
  store.set("user", user);
}
function getWorkspaceId() {
  return store.get("workspaceId");
}
function setWorkspaceId(id) {
  store.set("workspaceId", id);
}
function getOutputFormat() {
  return store.get("outputFormat");
}
function setOutputFormat(format) {
  store.set("outputFormat", format);
}
function clearConfig() {
  store.clear();
}
function isAuthenticated() {
  return store.get("token") !== null;
}
function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error("Not authenticated. Run `kami auth login` first.");
  }
}

export {
  getConfig,
  setConfig,
  getServerUrl,
  setServerUrl,
  getToken,
  setToken,
  setRefreshToken,
  getUser,
  setUser,
  getWorkspaceId,
  setWorkspaceId,
  getOutputFormat,
  setOutputFormat,
  clearConfig,
  isAuthenticated,
  requireAuth
};
