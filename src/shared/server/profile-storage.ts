import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'user_data');

export function toSafeProfileFilename(profileName: string) {
	const normalized = String(profileName || 'default')
		.trim()
		.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
		.replace(/\.+$/g, '')
		.replace(/\s+/g, ' ');

	return normalized && normalized !== '.' && normalized !== '..' ? normalized : 'default';
}

export function getProfileFilePath(profileName: string) {
	return path.join(DATA_DIR, `${toSafeProfileFilename(profileName)}.json`);
}

export async function writeProfileBackup(profileName: string, data: Record<string, unknown>, timestamp: number) {
	await fs.mkdir(DATA_DIR, { recursive: true });
	const filePath = getProfileFilePath(profileName);

	await fs.writeFile(
		filePath,
		JSON.stringify(
			{
				...data,
				_syncedAt: new Date().toISOString(),
				_timestamp: timestamp,
			},
			null,
			2,
		),
	);
}

export async function readProfileBackup(profileName: string) {
	const filePath = getProfileFilePath(profileName);
	const content = await fs.readFile(filePath, 'utf-8');
	return JSON.parse(content);
}
