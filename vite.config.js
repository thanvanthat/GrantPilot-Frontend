import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Use /GrantPilot-Frontend/ base when building for GitHub Pages or GitHub Actions CI.
// In local dev (`npm run dev`) use '/' so the app is at http://localhost:3000/
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.GITHUB_ACTIONS === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: isGitHubPages ? '/GrantPilot-Frontend/' : '/',
  plugins: [
    react(),
    {
      name: 'agent-proxy',
      configureServer(server) {
        server.middlewares.use('/api/agent', async (req, res, next) => {
          // Reconstruct full URL so the proxy can match correctly
          req.url = '/api/agent' + (req.url || '');
          try {
            const { agentProxyMiddleware } = await import('./src/server/apiProxy.js');
            await agentProxyMiddleware(req, res, next);
          } catch (e) {
            next(e);
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
