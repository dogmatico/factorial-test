import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import type { APIResponse } from 'base-api-interfaces';
import { CategoryConfigurationRules } from 'product-management-interfaces';

import { SERVER_BASE_URL } from '../../contants';
import { ProductConfigurationPage } from '../../product-configuration/pages/ProductConfigurationPage';


export const Route = createFileRoute('/shop/$productCategoryName')({
	component: RouteComponent,
	loader: ({
		params: { productCategoryName },
	}): APIResponse<CategoryConfigurationRules> => {
		return fetch(
			`${SERVER_BASE_URL}/api/v1/shop/category/${productCategoryName}`,
		).then((res) => res.json());
	},
});

function RouteComponent() {
	const { data } = Route.useLoaderData();

	return <ProductConfigurationPage configuration={data} />;
}
