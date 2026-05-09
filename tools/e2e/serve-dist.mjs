import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'dist'));
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
};

function resolvePath(urlPath = '/') {
	const pathname = decodeURIComponent(String(urlPath).split('?')[0] || '/');
	const normalizedPath = pathname === '/' ? '/index.html' : pathname;
	let candidate = normalize(join(rootDir, normalizedPath));

	if (!candidate.startsWith(rootDir)) {
		return null;
	}

	if (existsSync(candidate) && statSync(candidate).isDirectory()) {
		candidate = join(candidate, 'index.html');
	}

	if (!existsSync(candidate) && !extname(candidate)) {
		const indexCandidate = join(candidate, 'index.html');
		if (existsSync(indexCandidate)) {
			candidate = indexCandidate;
		}
	}

	return existsSync(candidate) ? candidate : null;
}

const server = http.createServer((request, response) => {
	const filePath = resolvePath(request.url || '/');
	if (!filePath) {
		response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		response.end('Not found');
		return;
	}

	const fileExtension = extname(filePath).toLowerCase();
	response.writeHead(200, {
		'Content-Type': mimeTypes[fileExtension] || 'application/octet-stream',
		'Cache-Control': 'no-cache',
	});

	createReadStream(filePath).pipe(response);
});

function shutdown(exitCode = 0) {
	server.close(() => process.exit(exitCode));
}

server.listen(port, host, () => {
	console.log(`Serving dist on http://${host}:${port}`);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
