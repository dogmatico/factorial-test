import type { Express } from 'express';

import { setupInventoryManagementControllers } from './controllers/setup.ts';

export function setupInventoryManagement(app: Express) {
	setupInventoryManagementControllers(app);
}
