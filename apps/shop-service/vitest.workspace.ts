// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

import { quickpickle } from 'quickpickle';

export default defineWorkspace([
	{
		// configuration for feature files testing the application
		extends: './vite.config.ts',
		plugins: [quickpickle()],
		test: {
			include: ['./**/*.feature'],
			setupFiles: [
				'./src/product-management/__test__/product-management.steps.ts',
				'./src/session-management/__test__/session-management.steps.ts',
			],
		},
	},
	{
		// a second configuration for feature files testing components
		extends: './vite.config.ts',
		test: {
			include: ['./**/*.spec.ts'],
		},
	},
]);
