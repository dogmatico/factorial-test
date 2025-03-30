import type { Request, Response } from 'express';

import { getInventoryManagementService } from '../../inventory-management/services/InventoryManagement.ts';
import { getProductConfigurationService } from '../../product-management/services/ProductConfigurationService.ts';
import { getLocalId } from '../../product-management/utils/global-ids.ts';
import {
	getDBConnection,
	getNativeDatabase,
} from '../../shared/connections/database.ts';
import { toInt } from '../../shared/helpers/toInt.ts';
import { getOrderManagementService } from '../services/OrderManagementService.ts';

export async function upsertConfigurationToSessionOrder(
	req: Request,
	res: Response,
) {
	const sessionId = req.session?.sessionId || 'SESSION_ID';

	const { componentBreakdown, configurationId, productCategoryId } =
		req.body as {
			configurationId: string;
			productCategoryId: string;
			componentBreakdown: Record<string, number>;
		};

	const productConfigurationService = getProductConfigurationService();

	const configValidationResult =
		await productConfigurationService.avaluateProductConfigurationBreakdown(
			{ id: productCategoryId },
			componentBreakdown,
		);

	if (!configValidationResult.isValid) {
		res.status(400).json({
			isSuccess: false,
			data: null,
			errors: configValidationResult.errors,
			warnings: [],
		});

		return;
	}

	const db = getDBConnection();
	const inventoryManagementService = getInventoryManagementService();

	const orderProcessResult = await db
		.transaction(async (tx) => {
			const { sucess: reservationSuccess } =
				await inventoryManagementService.reserveInventoryForSession(
					sessionId,
					Object.fromEntries(
						Object.entries(componentBreakdown).map(([id, quantity]) => [
							toInt(getLocalId(id)),
							quantity,
						]),
					),
				);

			if (!reservationSuccess) {
				tx.rollback();
				return {
					isSuccess: false,
					data: null,
					errors: [{ code: '424', description: 'Unable to reserve inventory' }],
					warnings: [],
				};
			}

			const orderManagementService = getOrderManagementService();
			const { insertedId: currentOrderId } =
				await orderManagementService.createSessionOrder(
					sessionId,
					req.session?.userId || sessionId,
				);

			const { configurationId: insertedConfigurationId } =
				await productConfigurationService.upsertCustomerConfiguration({
					configurationId,
					productCategoryId,
					componentBreakdown,
				});

			if (!insertedConfigurationId) {
				tx.rollback();
				return {
					isSuccess: false,
					data: null,
					errors: [
						{ code: '424', description: 'Unable to create configuration' },
					],
					warnings: [],
				};
			}

			await orderManagementService.addConfigurationToOrder(
				insertedConfigurationId,
				currentOrderId,
			);

			return {
				isSuccess: true,
				data: null,
				errors: [],
				warnings: [],
			};
		})
		.catch((err) => {
			console.error(err);
			return {
				isSuccess: false,
				data: null,
				errors: [{ code: '424', description: err }],
				warnings: [],
			};
		});

	res.status(200).json(orderProcessResult).end();
}
