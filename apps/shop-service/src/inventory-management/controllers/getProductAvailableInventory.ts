import type { APIResponse } from 'base-api-interfaces';
import type { Request, Response } from 'express';

import { makeGlobalId } from '../../product-management/utils/global-ids.ts';
import { getInventoryManagementService } from '../services/InventoryManagement.ts';

export async function getProductAvailableInventory(
	req: Request,
	res: Response,
) {
	const productName = req.params.productName;

	const inventoryManagementService = getInventoryManagementService();
	const availableInventory =
		await inventoryManagementService.getSessionInventoryForProductOptions(
			{ productName },
			req.session?.userId ?? '',
			{ maxUnits: 5 },
		);

	const responsePayload: APIResponse<Record<string, number>> = {
		isSuccess: true,
		data: Object.fromEntries(
			Object.entries(availableInventory).map(([id, units]) => [
				makeGlobalId('ComponentOption', id),
				units,
			]),
		),
		errors: [],
		warnings: [],
	};

	res.status(200).json(responsePayload).end();
}
