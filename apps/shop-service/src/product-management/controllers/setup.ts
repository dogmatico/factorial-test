import { type Express, Router } from 'express';

import { getConfigurationByNameController } from './getConfigurationByNameController.ts';

export function setupProductManagementControllers(app: Express) {
	const router = Router();

	router.get('/category/:productName', getConfigurationByNameController);
	app.use('/api/v1/shop', router);
}
