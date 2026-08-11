/**
 * Local-dev Neon transport configuration.
 *
 * In production the app talks to Neon over its hosted WebSocket/HTTP endpoints
 * and nothing here changes anything (NEON_WS_PROXY is unset). For local Postgres
 * we run `ghcr.io/neondatabase/wsproxy` in front of the database; the serverless
 * driver then connects WebSocket → wsproxy → Postgres (SCRAM-SHA-256).
 *
 * This only configures the shared `neonConfig` singleton — it does not touch the
 * better-auth Pool construction in lib/auth.ts (which remains load-bearing).
 */
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

let configured = false;

export function configureNeonForLocalDev() {
  if (configured) return;
  configured = true;

  neonConfig.webSocketConstructor = ws;

  if (process.env.NEON_WS_PROXY) {
    neonConfig.wsProxy = () => process.env.NEON_WS_PROXY as string;
    neonConfig.useSecureWebSocket = false;
    neonConfig.forceDisablePgSSL = true;
    // Normal handshake so SCRAM-SHA-256 auth works against plain Postgres.
    neonConfig.pipelineConnect = false;
  }
}

configureNeonForLocalDev();
