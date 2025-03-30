import type { CategoryConfigurationRules } from 'product-management-interfaces';
import React, { memo, useId } from 'react';
import { ProductComponentOption } from './ProductComponentOption';

export interface CategoryConfigurationComponentSectionProps {
	componentId: string;
	configuration: CategoryConfigurationRules;
}

export const CategoryConfigurationComponentSection = memo(
	function CategoryConfigurationComponentSection({
		componentId,
		configuration,
	}: CategoryConfigurationComponentSectionProps) {
		const productConfig = configuration.components[componentId];

		const productDescriptionId = useId();

		return (
			<section
				className="category-product-configuration-form-section-component"
				data-testid="category-product-configuration-form-section-component"
				data-component-id={componentId}
			>
				<fieldset aria-describedby={productDescriptionId}>
					<legend>{productConfig.name}</legend>
					<div
						id={productDescriptionId}
						className="category-product-configuration-form-section-component-description"
					>
						{productConfig.description}
					</div>

					{productConfig.availableOptions.map((optionId) => {
						const componentOption = configuration.componentOptions[optionId];

						return (
							<ProductComponentOption
								key={optionId}
								componentOption={componentOption}
								component={productConfig}
							/>
						);
					})}
				</fieldset>
			</section>
		);
	},
);
