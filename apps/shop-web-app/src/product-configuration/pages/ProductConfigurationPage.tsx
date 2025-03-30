import { redirect, useNavigate } from '@tanstack/react-router';
import type { APIResponse } from 'base-api-interfaces';
import type { CategoryConfigurationRules } from 'product-management-interfaces';
import React, { memo, useCallback } from 'react';
import { SERVER_BASE_URL } from '../../contants';
import { ProductConfigurationActionBar } from '../components/ProductConfigurationActionBar';
import {
	CategoryProductConfiguration,
	type OnSubmitCategoryProductConfigurationFormPayload,
} from '../components/ProductConfigurationForm';

export interface CategoryProductConfigurationFormProps {
	configuration: CategoryConfigurationRules | null;
}

export const ProductConfigurationPage = memo(function ProductConfigurationPage({
	configuration,
}: CategoryProductConfigurationFormProps) {
	const navigate = useNavigate();

	const onSubmit = useCallback(
		(payload: OnSubmitCategoryProductConfigurationFormPayload) => {
			fetch(`${SERVER_BASE_URL}/api/v1/shop/chart/configuration`, {
				method: 'PUT',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((res) => res.json())
				.then((res: APIResponse<null>) => {
					if (res.isSuccess) {
						navigate({ to: '/checkout' });
					} else {
						console.error(res);
					}
				});
		},
		[navigate],
	);

	return configuration ? (
		<div className="shop-configuration-page">
			<main className="shop-configuration-page-main-content">
				<section className="shop-configuration-page-section--description">
					<header>{configuration.category.name}</header>
					<div>{configuration.category.description}</div>
				</section>
				<section className="shop-configuration-page-section--config-form">
					<CategoryProductConfiguration
						configuration={configuration}
						onSubmit={onSubmit}
					/>
				</section>
			</main>
			<ProductConfigurationActionBar />
		</div>
	) : (
		<h1>Product not found</h1>
	);
});
