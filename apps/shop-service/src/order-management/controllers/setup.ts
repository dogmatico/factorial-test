import { type Express, Router } from 'express';

import { getSessionOrderController } from './getSessionOrderController.ts';
import { upsertConfigurationToSessionOrderController } from './upsertConfigurationToSessionOrderController.ts';

export function setupOrderManagementControllers(app: Express) {
	const router = Router();

	router.put(
		'/chart/configuration',
		upsertConfigurationToSessionOrderController,
	);
	router.get('/chart/configuration', getSessionOrderController);
	app.use('/api/v1/shop', router);
}
