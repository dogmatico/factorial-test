import type { Request, Response } from 'express';

import { getOrderManagementService } from '../services/OrderManagementService.ts';

export async function getSessionOrderController(req: Request, res: Response) {
	const sessionId = req.session?.sessionId || 'SESSION_ID';
	const userId = req.session?.userId || sessionId;

	const orderManagementService = getOrderManagementService();
	const sessionOrder = await orderManagementService.getSessionOrder(
		sessionId,
		userId,
	);

	res.status(200).json(sessionOrder).end();
}
