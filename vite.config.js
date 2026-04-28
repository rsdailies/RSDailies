import https from 'https';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const PENGUIN_SOURCE_URL = 'https://jq.world60pengs.com/rest/cache/actives.json';
const PENGUIN_PROXY_PATHS = ['/api/penguins/actives', '/RSDailies/api/penguins/actives'];

function isPenguinProxyRequest(url = '') {
  return PENGUIN_PROXY_PATHS.some((path) => url.startsWith(path));
}

function handlePenguinProxy(req, res) {
  https
    .get(PENGUIN_SOURCE_URL, (upstream) => {
      const chunks = [];

      upstream.on('data', (chunk) => chunks.push(chunk));
      upstream.on('end', () => {
        const body = Buffer.concat(chunks);
        res.statusCode = upstream.statusCode || 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(body);
      });
    })
    .on('error', (error) => {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'penguin_proxy_failed', detail: String(error) }));
    });
}

function penguinProxyPlugin() {
  return {
    name: 'penguin-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!isPenguinProxyRequest(req.url || '')) {
          next();
          return;
        }

        handlePenguinProxy(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!isPenguinProxyRequest(req.url || '')) {
          next();
          return;
        }

        handlePenguinProxy(req, res);
      });
    }
  };
}

export default defineConfig({
  base: '/RSDailies/',
  root: 'src/ui/app-shell/html',
  publicDir: resolve(__dirname, 'assets'),
  plugins: [penguinProxyPlugin()],
  build: {
    outDir: '../../../../dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/ui/app-shell/html/index.html')
    }
  },
  server: {
    host: true,
    port: 5173,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
    open: true,
  },
});
