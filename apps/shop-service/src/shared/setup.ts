import cors from 'cors';
import type { Express } from 'express';

import { setupBusinessEventsBus } from './business-events-bus/setup.ts';

export function setupSharedFunctionatily(app: Express) {
	// Add CORS support without restriction for testing purposes
	app.use(cors());

	setupBusinessEventsBus(app);
}
