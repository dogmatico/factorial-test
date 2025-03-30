import { type Express, Router } from 'express';

import { upsertConfigurationToSessionOrder } from './upsertConfigurationToSessionOrder.ts';

export function setupOrderManagementControllers(app: Express) {
	const router = Router();

	router.put('/chart/configuration', upsertConfigurationToSessionOrder);
	app.use('/api/v1/shop', router);
}
