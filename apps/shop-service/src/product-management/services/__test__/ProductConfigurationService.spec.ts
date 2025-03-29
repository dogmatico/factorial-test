import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { preloadData } from '../../../preloadData';
import {
	dropNativeDatabase,
	getDBConnection,
} from '../../../shared/connections/database';
import { ProductConfigurationService } from '../ProductConfigurationService';
import { bycicleConfigurationWithSeedData } from './__fixtures__/bycicleConfigurationWithSeedData';

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

	describe('getProductConfigurationByName', () => {
		test('should return a configuration object for existing categories', async () => {
			const productConfiguration =
				await service.getProductConfigurationByName('Bicycles');
			expect(productConfiguration).toEqual(bycicleConfigurationWithSeedData);
		});

		test('should return null for existing categories', async () => {
			const productConfiguration =
				await service.getProductConfigurationByName('FALSE_CATEGORY');
			expect(productConfiguration).toBeNull();
		});
	});

	describe('getProductConfigurationByName', () => {
		test('should return a configuration object for existing categories', async () => {
			const productConfiguration =
				await service.getProductConfigurationByName('Bicycles');
			expect(productConfiguration).toEqual(bycicleConfigurationWithSeedData);
		});

		test('should return null for existing categories', async () => {
			const productConfiguration =
				await service.getProductConfigurationByName('FALSE_CATEGORY');
			expect(productConfiguration).toBeNull();
		});
	});

	describe('avaluateProductConfigurationBreakdown', () => {});
});
