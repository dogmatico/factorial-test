import { type Express, Router } from 'express';

import { getProductAvailableInventory } from './getProductAvailableInventory.ts';

export function setupProductManagementControllers(app: Express) {
	const router = Router();

	router.get(
		'/category/:productName/available_inventory',
		getProductAvailableInventory,
	);
	app.use('/api/v1/shop', router);
}
