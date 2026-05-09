import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	fullyParallel: false,
	retries: 0,
	reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
  },
  projects: [
		{
			name: 'chromium-smoke',
			use: {
				...devices['Desktop Chrome'],
				browserName: 'chromium',
			},
		},
	],
});
