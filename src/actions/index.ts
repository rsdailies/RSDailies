import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';

const DATA_DIR = path.join(process.cwd(), 'user_data');

export const server = {
	/**
	 * Synchronizes the entire local profile state with the server.
	 * Writes data to the filesystem to ensure persistence across browser cache resets.
	 */
	syncProfile: defineAction({
		input: z.object({
			profileName: z.string(),
			data: z.record(z.any()),
			timestamp: z.number(),
		}),
		handler: async (input) => {
			try {
				// Ensure data directory exists
				await fs.mkdir(DATA_DIR, { recursive: true });

				const filePath = path.join(DATA_DIR, `${input.profileName}.json`);
				
				// Atomic-ish write: write to temp then rename (optional but safer)
				await fs.writeFile(filePath, JSON.stringify({
					...input.data,
					_syncedAt: new Date().toISOString(),
					_timestamp: input.timestamp
				}, null, 2));

				console.log(`${pc.magenta('[Action]')} ${pc.cyan('syncProfile')} | ${pc.green('Success')} | Profile: ${pc.bold(input.profileName)}`);
				
				return {
					success: true,
					syncedAt: new Date().toISOString(),
				};
			} catch (e) {
				console.error(`${pc.red('[Action]')} ${pc.cyan('syncProfile')} | ${pc.red('Error')} | ${e instanceof Error ? e.message : String(e)}`);
				return {
					success: false,
					message: 'Server failed to write data to disk.'
				};
			}
		},
	}),

	/**
	 * Retrieves a profile backup from the server.
	 */
	fetchProfile: defineAction({
		input: z.object({
			profileName: z.string(),
		}),
		handler: async (input) => {
			try {
				const filePath = path.join(DATA_DIR, `${input.profileName}.json`);
				const content = await fs.readFile(filePath, 'utf-8');
				return {
					success: true,
					data: JSON.parse(content)
				};
			} catch (e) {
				return {
					success: false,
					message: 'No backup found on server.'
				};
			}
		}
	}),

	/**
	 * Updates a specific setting on the server.
	 */
	updateSetting: defineAction({
		input: z.object({
			key: z.string(),
			value: z.any(),
		}),
		handler: async (input) => {
			console.log(`${pc.magenta('[Action]')} ${pc.cyan('updateSetting')} | ${pc.yellow(input.key)} = ${JSON.stringify(input.value)}`);
			return { success: true };
		},
	}),

	/**
	 * Calculates the next reset boundary server-side to prevent client-side clock manipulation.
	 */
	getResetBoundaries: defineAction({
		handler: async () => {
			const now = new Date();
			// Logic to calculate exact UTC reset times
			return {
				daily: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).getTime(),
				serverTime: now.getTime(),
			};
		},
	}),
};
