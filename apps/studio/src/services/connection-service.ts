import type { ConnectionStatus } from "@sigil/core";

const CONN_KEY = "sigil_github_connected";

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  const isConnected = localStorage.getItem(CONN_KEY) === "true";
  return {
    connected: isConnected,
    scopes: isConnected ? ["read:user"] : [],
    lastUsedAt: isConnected ? new Date().toISOString() : null,
  };
}

export async function setConnected(status: boolean): Promise<void> {
  if (status) {
    localStorage.setItem(CONN_KEY, "true");
  } else {
    localStorage.removeItem(CONN_KEY);
  }
}

export async function disconnect(): Promise<{ success: boolean }> {
  localStorage.removeItem(CONN_KEY);
  return { success: true };
}
