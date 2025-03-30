import type {
	CategoryConfigurationRules,
	ProductBreakdownValidator,
} from 'product-management-interfaces';
import React, { memo, useId } from 'react';
import { CategoryConfigurationErrorOutlet } from './CategoryConfigurationErrorOutlet';
import { ProductComponentOption } from './ProductComponentOption';

export interface CategoryConfigurationComponentSectionProps {
	componentId: string;
	configuration: CategoryConfigurationRules;
	validator: ProductBreakdownValidator;
}

export const CategoryConfigurationComponentSection = memo(
	function CategoryConfigurationComponentSection({
		componentId,
		configuration,
		validator,
	}: CategoryConfigurationComponentSectionProps) {
		const productConfig = configuration.components[componentId];

		const productDescriptionId = useId();
		const productErrorsId = useId();

		return (
			<section
				className="category-product-configuration-form-section-component"
				data-testid="category-product-configuration-form-section-component"
				data-component-id={componentId}
			>
				<fieldset
					aria-describedby={`${productDescriptionId} ${productErrorsId}`}
				>
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
								validator={validator}
							/>
						);
					})}

					<CategoryConfigurationErrorOutlet
						productComponentId={componentId}
						id={productErrorsId}
					/>
				</fieldset>
			</section>
		);
	},
);
