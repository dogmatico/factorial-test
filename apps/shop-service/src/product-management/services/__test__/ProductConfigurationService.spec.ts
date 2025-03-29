import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { preloadData } from '../../../preloadData';
import {
	dropNativeDatabase,
	getDBConnection,
} from '../../../shared/connections/database';
import { ProductConfigurationService } from '../ProductConfigurationService';
import { bycicleConfigurationWithSeedData } from './__fixtures__/bycicleConfigurationWithSeedData';
import {
	correctBasicBycicleBreakdown,
	correctWithSupplementBycicleBreakdown,
	wrongWithExtraUnitsBycicleBreakdown,
	wrongWithForbiddenUnitsBycicleBreakdown,
	wrongWithMissingUnitsBycicleBreakdown,
} from './__fixtures__/product-breakdown';

describe('ProductConfigurationService', () => {
	let service: ProductConfigurationService;

	beforeEach(async () => {
		await preloadData();

		const db = getDBConnection();
		service = new ProductConfigurationService(db);
	});

	afterEach(() => {
		dropNativeDatabase();
	});

	describe('getProductConfiguration', () => {
		test('should return a configuration object for existing categories', async () => {
			const productConfiguration = await service.getProductConfiguration({
				productName: 'Bicycles',
			});
			expect(productConfiguration).toEqual(bycicleConfigurationWithSeedData);
		});

		test('should return null for existing categories', async () => {
			const productConfiguration = await service.getProductConfiguration({
				productName: 'FALSE_CATEGORY',
			});
			expect(productConfiguration).toBeNull();
		});
	});

	describe('avaluateProductConfigurationBreakdown', () => {
		const bycicleProductId = { id: '1' };

		test('should return the price for a valid product breakdown without supplements', async () => {
			const result = await service.avaluateProductConfigurationBreakdown(
				bycicleProductId,
				correctBasicBycicleBreakdown,
			);

			expect(result).toEqual({
				isValid: true,
				breakdownPrice: 273,
				errors: [],
			});
		});

		test('should return the price for a valid product breakdown with supplements', async () => {
			const result = await service.avaluateProductConfigurationBreakdown(
				bycicleProductId,
				correctWithSupplementBycicleBreakdown,
			);

			expect(result).toEqual({
				isValid: true,
				breakdownPrice: 345,
				errors: [],
			});
		});

		test('should return the errors for excess units', async () => {
			const result = await service.avaluateProductConfigurationBreakdown(
				bycicleProductId,
				wrongWithExtraUnitsBycicleBreakdown,
			);

			expect(result).toEqual({
				isValid: false,
				breakdownPrice: expect.any(Number),
				errors: ['Provided 1 units in excess for component Frame Type'],
			});
		});

		test('should return the errors for missing units', async () => {
			const result = await service.avaluateProductConfigurationBreakdown(
				bycicleProductId,
				wrongWithMissingUnitsBycicleBreakdown,
			);

			expect(result).toEqual({
				isValid: false,
				breakdownPrice: expect.any(Number),
				errors: [
					'Missing 1 units for component Frame Type',
					'Missing 1 units for component Frame Finish',
				],
			});
		});

		test('should return the errors for invalid direct forbidden rule', async () => {
			const result = await service.avaluateProductConfigurationBreakdown(
				bycicleProductId,
				wrongWithForbiddenUnitsBycicleBreakdown,
			);

			expect(result).toEqual({
				isValid: false,
				breakdownPrice: expect.any(Number),
				errors: ['Invalid combination: Fat bike wheels cannot have red rims'],
			});
		});
	});
});
