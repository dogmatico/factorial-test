import type { Express } from 'express';

import { setupOrderManagementEventHandlers } from './business-event-handlers/setup.ts';
import { setupOrderManagementControllers } from './controllers/setup.ts';

export function setupOrderManagement(app: Express) {
	setupOrderManagementControllers(app);
	setupOrderManagementEventHandlers();
}
