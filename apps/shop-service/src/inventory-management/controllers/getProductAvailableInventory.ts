import type { Request, Response } from 'express';

import type { APIResponse } from '../../shared/interfaces.ts';
import { getInventoryManagementService } from '../services/InventoryManagement.ts';

export async function getProductAvailableInventory(
	req: Request,
	res: Response,
) {
	const productName = req.params.productName;

	const inventoryManagementService = getInventoryManagementService();
	const configuration =
		await inventoryManagementService.getSessionInventoryForProductOptions(
			{ productName },
			req.session?.userId ?? '',
			{ maxUnits: 5 },
		);

	const responsePayload: APIResponse<Record<string, number>> = {
		isSuccess: true,
		data: configuration,
		errors: [],
		warnings: [],
	};

	res.status(200).json(responsePayload).end();
}
