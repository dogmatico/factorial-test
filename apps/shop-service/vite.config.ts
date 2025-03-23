// vite.config.ts
import { quickpickle } from 'quickpickle';

export default {
	plugins: [quickpickle()],
	test: {
		include: ['**/*.feature'],
		setupFiles: [
			'./src/session-management/__test__/session-management.steps.ts',
		],
	},
};
