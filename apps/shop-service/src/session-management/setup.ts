import cookieSession from 'cookie-session';
import type { Express } from 'express';

import { setupSessionManagementControllers } from './controllers/setup.ts';

export function setupInitSessionManagement(app: Express) {
	app.use(
		cookieSession({
			name: 'session',
			// for demo purposes
			secret: 'UNSECURE_KEY',

			// Cookie Options
			maxAge: 10 * 60 * 1000, // 10 mins
		}),
	);

	setupSessionManagementControllers(app);
}
