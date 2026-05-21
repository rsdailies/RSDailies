import type { APIRoute } from 'astro';

const DEFAULT_SOURCE_URLS = [
	'https://jq.world60pengs.com/rest/cache/actives.json',
	'https://jq.world60pengs.com/',
	'https://world60pengs.com/',
];

function normalizePayload(payload: any) {
	if (payload?.Activepenguin) {
		return payload;
	}

	if (payload?.data?.Activepenguin) {
		return payload.data;
	}

	if (payload?.payload?.Activepenguin) {
		return payload.payload;
	}

	return null;
}

function tryParseInlinePayload(source: string) {
	const directObjectMatch = source.match(/\{[\s\S]*"Activepenguin"[\s\S]*"Bear"[\s\S]*\}/);
	if (directObjectMatch) {
		try {
			return normalizePayload(JSON.parse(directObjectMatch[0]));
		} catch {
			// Continue to the array-based parser below.
		}
	}

	const arrayMatch = source.match(
		/["']?Activepenguin["']?\s*[:=]\s*(\[[\s\S]*?\])[\s\S]*?["']?Bear["']?\s*[:=]\s*(\[[\s\S]*?\])/,
	);

	if (!arrayMatch) {
		return null;
	}

	try {
		return {
			Activepenguin: JSON.parse(arrayMatch[1]),
			Bear: JSON.parse(arrayMatch[2]),
		};
	} catch {
		return null;
	}
}

async function fetchPenguinSource(url: string) {
	const response = await fetch(url, {
		headers: {
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.9',
			'Cache-Control': 'no-cache',
			Pragma: 'no-cache',
			'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
			'Sec-Ch-Ua-Mobile': '?0',
			'Sec-Ch-Ua-Platform': '"Windows"',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'none',
			'Sec-Fetch-User': '?1',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		},
	});

	if (!response.ok) {
		throw new Error(`${url} responded with ${response.status}`);
	}

	const contentType = response.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		return normalizePayload(await response.json());
	}

	const text = await response.text();
	const trimmed = text.trim();

	if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
		try {
			return normalizePayload(JSON.parse(trimmed));
		} catch {
			// Fall through to inline parsing.
		}
	}

	return tryParseInlinePayload(text);
}

export const GET: APIRoute = async () => {
	const configuredUrl = String(import.meta.env.PUBLIC_PENGUIN_API_URL || '').trim();
	const candidates = [configuredUrl, ...DEFAULT_SOURCE_URLS].filter(Boolean);
	const failures: string[] = [];

	for (const candidate of candidates) {
		try {
			const payload = await fetchPenguinSource(candidate);
			if (payload?.Activepenguin?.length) {
				return new Response(JSON.stringify(payload), {
					status: 200,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Cache-Control': 'public, max-age=300',
					},
				});
			}

			failures.push(`${candidate}: no active penguin payload found`);
		} catch (error) {
			failures.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return new Response(
		JSON.stringify({
			error: 'Unable to fetch penguin data',
			failures,
		}),
		{
			status: 502,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Cache-Control': 'no-store',
			},
		},
	);
};
