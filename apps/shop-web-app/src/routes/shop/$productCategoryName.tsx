import { createFileRoute } from '@tanstack/react-router';
import type { APIResponse } from 'base-api-interfaces';
import type { CategoryConfigurationRules } from 'product-management-interfaces';
import React from 'react';

import { SERVER_BASE_URL } from '../../contants';
import { ProductConfigurationPage } from '../../product-configuration/pages/ProductConfigurationPage';

export const Route = createFileRoute('/shop/$productCategoryName')({
	component: RouteComponent,
	loader: ({
		params: { productCategoryName },
	}): Promise<
		[
			APIResponse<Record<string, number>>,
			APIResponse<CategoryConfigurationRules>,
		]
	> => {
		return Promise.all([
			fetch(
				`${SERVER_BASE_URL}/api/v1/shop/category/${productCategoryName}/available_inventory`,
			).then((res) => res.json()),
			fetch(
				`${SERVER_BASE_URL}/api/v1/shop/category/${productCategoryName}`,
			).then((res) => res.json()),
		]);
	},
});

function RouteComponent() {
	const [inventoryData, configData] = Route.useLoaderData();

	return (
		<ProductConfigurationPage
			configuration={configData.data}
			availableInventory={inventoryData.data}
		/>
	);
}
