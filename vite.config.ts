import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

// Serves the Vercel function api/notify.ts during `npm run dev`, so the
// Request a Callback email works locally with the SMTP settings from `.env`.
// (In production Vercel runs api/notify.ts itself.)
function notifyApiDev(mode: string): Plugin {
  return {
    name: 'notify-api-dev',
    apply: 'serve',
    configureServer(server) {
      // Load ALL .env vars (not only VITE_*) into the dev server's process — they
      // stay server-side and are never exposed to the browser bundle.
      const env = loadEnv(mode, process.cwd(), '');
      for (const [k, v] of Object.entries(env)) {
        if (k.startsWith('SMTP_') || k === 'NOTIFY_TO') process.env[k] ??= v;
      }
      server.middlewares.use('/api/notify', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/notify.ts');
          await mod.default(req, res);
        } catch (err) {
          console.error('[api/notify]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: 'notify failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), notifyApiDev(mode)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
