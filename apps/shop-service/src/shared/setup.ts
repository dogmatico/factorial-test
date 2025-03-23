import type { Express } from 'express';

import { setupBusinessEventsBus } from './business-events-bus/setup.ts';

export function setupSharedFunctionatily(app: Express) {
	setupBusinessEventsBus(app);
}
