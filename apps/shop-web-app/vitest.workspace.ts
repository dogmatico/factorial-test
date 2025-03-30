// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	{
		// a second configuration for feature files testing components
		extends: './vite.config.ts',
		test: {
			include: ['./**/*.spec.ts(x)?'],
			// 👋 add the line below to add jsdom to vite
			environment: 'jsdom',
			setupFiles: './setup-tests.ts',
		},
	},
]);
