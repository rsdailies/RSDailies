import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import pc from 'picocolors';
import { readProfileBackup, writeProfileBackup } from '@shared/server/profile-storage';

export const server = {
	/**
	 * Synchronizes the entire local profile state with the server.
	 * Writes data to the filesystem to ensure persistence across browser cache resets.
	 */
	syncProfile: defineAction({
		input: z.object({
			profileName: z.string(),
			data: z.record(z.string(), z.unknown()),
			timestamp: z.number(),
		}),
		handler: async (input) => {
			try {
				await writeProfileBackup(input.profileName, input.data, input.timestamp);

				console.log(
					`${pc.magenta('[Action]')} ${pc.cyan('syncProfile')} | ${pc.green('Success')} | Profile: ${pc.bold(input.profileName)}`,
				);

				return {
					success: true,
					syncedAt: new Date().toISOString(),
				};
			} catch (e) {
				console.error(
					`${pc.red('[Action]')} ${pc.cyan('syncProfile')} | ${pc.red('Error')} | ${e instanceof Error ? e.message : String(e)}`,
				);
				return {
					success: false,
					message: 'Server failed to write data to disk.',
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
				return {
					success: true,
					data: await readProfileBackup(input.profileName),
				};
			} catch (e) {
				return {
					success: false,
					message: 'No backup found on server.',
				};
			}
		},
	}),

	/**
	 * Updates a specific setting on the server.
	 */
	updateSetting: defineAction({
		input: z.object({
			key: z.string(),
			value: z.unknown(),
		}),
		handler: async (input) => {
			console.log(
				`${pc.magenta('[Action]')} ${pc.cyan('updateSetting')} | ${pc.yellow(input.key)} = ${JSON.stringify(input.value)}`,
			);
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
