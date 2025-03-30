import type { Express } from 'express';

import { setupProductManagementControllers } from '../product-management/controllers/setup.ts';

export function setupInventoryManagement(app: Express) {
	setupProductManagementControllers(app);
}
