import type { Express } from 'express';

import { setupProductManagementControllers } from './controllers/setup.ts';

export function setupProductManagement(app: Express) {
	setupProductManagementControllers(app);
}
