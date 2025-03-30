import type { CategoryConfigurationRules } from 'product-management-interfaces';
import React, { memo } from 'react';
import { ProductConfigurationActionBar } from '../components/ProductConfigurationActionBar';
import { CategoryProductConfiguration } from '../components/ProductConfigurationForm';

export interface CategoryProductConfigurationFormProps {
	configuration: CategoryConfigurationRules | null;
}

export const ProductConfigurationPage = memo(function ProductConfigurationPage({
	configuration,
}: CategoryProductConfigurationFormProps) {
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
						onChange={console.log}
					/>
				</section>
			</main>
			<ProductConfigurationActionBar />
		</div>
	) : (
		<h1>Product not found</h1>
	);
});
