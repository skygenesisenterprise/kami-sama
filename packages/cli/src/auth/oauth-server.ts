import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

export interface CallbackResult {
  token: string;
  refreshToken?: string;
  state?: string;
  user?: Record<string, unknown>;
}

/**
 * Start a one-shot local HTTP server that waits for a single OAuth callback.
 * Returns a promise that resolves with the callback data or rejects on timeout.
 */
export function waitForOAuthCallback(
  port: number,
  timeoutMs = 120_000,
): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      // CORS headers for cross-origin requests from the browser
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url ?? '/', `http://localhost:${port}`);

      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token');
        const refreshToken = url.searchParams.get('refreshToken');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html><body style="font-family:system-ui;text-align:center;padding:60px">
              <h2>❌ Authentication failed</h2>
              <p>${error}</p>
              <p style="color:#666">You can close this tab.</p>
            </body></html>
          `);
          if (!resolved) {
            resolved = true;
            server.close();
            reject(new Error(error));
          }
          return;
        }

        if (!token) {
          // POST callback from cli-auth page sends JSON body
          if (req.method === 'POST') {
            let body = '';
            for await (const chunk of req) body += chunk;
            try {
              const json = JSON.parse(body);
              const postToken = json.token;
              const postRefreshToken = json.refreshToken;
              const postState = json.state;
              const postUser = json.user;

              if (!postToken) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing token in POST body' }));
                return;
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));

              if (!resolved) {
                resolved = true;
                server.close();
                resolve({
                  token: postToken,
                  refreshToken: postRefreshToken ?? undefined,
                  state: postState ?? undefined,
                  user: postUser ?? undefined,
                });
              }
              return;
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON body' }));
              return;
            }
          }

          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html><body style="font-family:system-ui;text-align:center;padding:60px">
              <h2>⚠️ Missing token</h2>
              <p style="color:#666">You can close this tab.</p>
            </body></html>
          `);
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html><body style="font-family:system-ui;text-align:center;padding:60px">
            <h2>✅ Authenticated!</h2>
            <p>You can close this tab and return to the terminal.</p>
            <script>setTimeout(() => window.close(), 2000)</script>
          </body></html>
        `);

        if (!resolved) {
          resolved = true;
          server.close();
          resolve({
            token,
            refreshToken: refreshToken ?? undefined,
            state: state ?? undefined,
          });
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, '127.0.0.1');

    server.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        server.close();
        reject(new Error('OAuth callback timed out'));
      }
    }, timeoutMs);
  });
}
