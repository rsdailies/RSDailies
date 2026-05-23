import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import { extname, join, normalize } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..', '..'));
const staticRoot = normalize(join(repoRoot, '.vercel', 'output', 'static'));
const configPath = join(repoRoot, '.vercel', 'output', 'config.json');
const renderEntryPath = join(repoRoot, '.vercel', 'output', '_functions', 'entry.mjs');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4174);

const mimeTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml; charset=utf-8',
	'.ts': 'text/javascript; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml; charset=utf-8',
};

function ensureBuildOutputs() {
	if (!existsSync(staticRoot) || !existsSync(configPath) || !existsSync(renderEntryPath)) {
		throw new Error('Missing Vercel build output. Run `npm run build` before starting preview.');
	}
}

function resolveStaticPath(urlPath = '/') {
	const pathname = decodeURIComponent(String(urlPath).split('?')[0] || '/');
	const normalizedPath = pathname === '/' ? '/index.html' : pathname;
	let candidate = normalize(join(staticRoot, normalizedPath));

	if (!candidate.startsWith(staticRoot)) return null;

	if (existsSync(candidate) && statSync(candidate).isDirectory()) {
		candidate = join(candidate, 'index.html');
	}

	if (!existsSync(candidate) && !extname(candidate)) {
		const indexCandidate = join(candidate, 'index.html');
		if (existsSync(indexCandidate)) candidate = indexCandidate;
	}

	return existsSync(candidate) ? candidate : null;
}

function routeToRegExp(route) {
	return route?.src ? new RegExp(route.src) : null;
}

async function loadPreviewRuntime() {
	ensureBuildOutputs();
	const [{ default: renderRuntime }, configText] = await Promise.all([
		import(pathToFileURL(renderEntryPath).href),
		import('node:fs/promises').then(({ readFile }) => readFile(configPath, 'utf8')),
	]);

	const config = JSON.parse(configText);
	const renderRoutes = Array.isArray(config?.routes)
		? config.routes
				.filter((route) => route?.dest === '_render' && route?.src)
				.map((route) => ({ ...route, regexp: routeToRegExp(route) }))
		: [];
	const notFoundRoute = Array.isArray(config?.routes)
		? config.routes.find((route) => route?.status === 404 && route?.dest)
		: null;

	if (typeof renderRuntime?.fetch !== 'function') {
		throw new Error('Built Vercel render runtime does not expose fetch().');
	}

	return {
		renderFetch: renderRuntime.fetch.bind(renderRuntime),
		renderRoutes,
		notFoundRoute,
	};
}

function shouldUseRenderRuntime(pathname, renderRoutes) {
	return renderRoutes.some((route) => route.regexp?.test(pathname));
}

function nodeHeadersToObject(headers) {
	return Object.fromEntries(
		Object.entries(headers).flatMap(([key, value]) => {
			if (typeof value === 'undefined') return [];
			return [[key, Array.isArray(value) ? value.join(', ') : String(value)]];
		}),
	);
}

async function proxyToRenderRuntime(req, res, renderFetch) {
	const url = new URL(req.url || '/', `http://${host}:${port}`);
	const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
	const request = new Request(url, {
		method: req.method,
		headers: nodeHeadersToObject(req.headers),
		body: hasBody ? req : undefined,
		duplex: hasBody ? 'half' : undefined,
	});

	const response = await renderFetch(request);
	const headerEntries = {};
	response.headers.forEach((value, key) => {
		headerEntries[key] = value;
	});
	res.writeHead(response.status, headerEntries);

	if (!response.body || req.method === 'HEAD') {
		res.end();
		return;
	}

	Readable.fromWeb(response.body).pipe(res);
}

function serveStaticFile(filePath, res, statusCode = 200) {
	const fileExtension = extname(filePath).toLowerCase();
	res.writeHead(statusCode, {
		'Content-Type': mimeTypes[fileExtension] || 'application/octet-stream',
		'Cache-Control': 'no-cache',
	});
	createReadStream(filePath).pipe(res);
}

const runtime = await loadPreviewRuntime();

const server = http.createServer(async (req, res) => {
	try {
		const pathname = decodeURIComponent(String(req.url || '/').split('?')[0] || '/');
		const staticFile = resolveStaticPath(pathname);
		if (staticFile) {
			serveStaticFile(staticFile, res);
			return;
		}

		if (shouldUseRenderRuntime(pathname, runtime.renderRoutes)) {
			await proxyToRenderRuntime(req, res, runtime.renderFetch);
			return;
		}

		if (runtime.notFoundRoute?.dest) {
			const notFoundPath = resolveStaticPath(runtime.notFoundRoute.dest);
			if (notFoundPath) {
				serveStaticFile(notFoundPath, res, Number(runtime.notFoundRoute.status) || 404);
				return;
			}
		}

		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Not found');
	} catch (error) {
		res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end(error instanceof Error ? error.message : 'Preview server failed.');
	}
});

function shutdown(exitCode = 0) {
	server.close(() => process.exit(exitCode));
}

server.listen(port, host, () => {
	console.log(`Serving preview on http://${host}:${port}`);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
