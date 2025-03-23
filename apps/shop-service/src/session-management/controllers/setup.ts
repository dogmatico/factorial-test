import { type Express, Router } from 'express';

import { sessionCreateController } from './sessionCreateController.ts';
import { sessionDeleteController } from './sessionDeleteController.ts';

export function setupSessionManagementControllers(app: Express) {
	const router = Router();

	router.post('/currentSession', sessionCreateController);
	router.delete('/currentSession', sessionDeleteController);

	app.use('/api/v1/shop', router);
}
