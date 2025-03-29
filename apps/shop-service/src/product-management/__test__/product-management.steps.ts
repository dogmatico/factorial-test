import { Given, type QuickPickleWorld, Then, When } from 'quickpickle';
import supertest, { type Test } from 'supertest';
import { expect } from 'vitest';
import { app } from '../../app';
import { preloadData } from '../../preloadData';
import { dropNativeDatabase } from '../../shared/connections/database';
import { bycicleConfigurationWithSeedData } from '../services/__test__/__fixtures__/bycicleConfigurationWithSeedData';

interface WorldWithData extends QuickPickleWorld {
	data: {
		request: Test;
	};
}

Given('the default data seed is loaded', async () => {
	dropNativeDatabase();

	await preloadData();
});

When(
	'the consumer retrieves the data for the product {string}',
	(world: WorldWithData, productName) => {
		world.data.request = supertest(app).get(
			`/api/v1/shop/category/${productName}`,
		);
	},
);

Then(
	'the configuration for {string} is returned',
	async (world: WorldWithData, productName) => {
		if (productName !== 'Bicycles') {
			throw new Error('Unknown test case');
		}

		const requestResult = await world.data.request;
		expect(requestResult.body).toEqual({
			isSuccess: true,
			data: bycicleConfigurationWithSeedData,
			errors: [],
			warnings: [],
		});
	},
);
