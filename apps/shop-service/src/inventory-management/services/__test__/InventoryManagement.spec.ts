import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { preloadData } from '../../../preloadData';
import { ProductConfigurationService } from '../../../product-management/services/ProductConfigurationService';
import {
	dropNativeDatabase,
	getDBConnection,
} from '../../../shared/connections/database';
import { InventoryManagementService } from '../InventoryManagement';

describe('InventoryManagementService', () => {
	let service: InventoryManagementService;

	beforeEach(async () => {
		await preloadData();

		const db = getDBConnection();

		const productConfigurationService = new ProductConfigurationService(db);
		service = new InventoryManagementService(db, productConfigurationService);
	});

	afterEach(() => {
		dropNativeDatabase();
	});

	describe('getAvailableInventory', () => {
		test('should return the real physical inventory for the given component options if no session is provided', async () => {
			const inventoryQueryResult = await service.getAvailableInventory([
				'1',
				'2',
				'6',
				'8',
			]);
			expect(inventoryQueryResult).toEqual({
				'1': 10,
				'2': 15,
				'6': 12,
				'8': 3,
			});
		});

		test('should return the inventory with quota plus overbooking for the given component options if session is provided', async () => {
			const inventoryQueryResult = await service.getAvailableInventory(
				['1', '2', '6', '8'],
				{ sessionId: 'NOT_REAL_MANAGEMENT' },
			);

			// 10 percent overbooking allowed
			expect(inventoryQueryResult).toEqual({
				'1': 11,
				'2': 16,
				'6': 13,
				'8': 3,
			});
		});
	});

	describe('getSessionInventoryForProductOptions', () => {
		test('should return all available inventory for the product options capped by the maxUnits options', async () => {
			const inventoryQueryResult =
				await service.getSessionInventoryForProductOptions(
					{ productName: 'Bicycles' },
					'NOT_REAL',
					{ maxUnits: 12 },
				);

			expect(inventoryQueryResult).toEqual({
				'1': 11,
				'10': 12,
				'11': 12,
				'12': 12,
				'13': 12,
				'2': 12,
				'3': 8,
				'4': 12,
				'5': 12,
				'6': 12,
				'7': 0,
				'8': 3,
				'9': 2,
			});
		});
	});
});
