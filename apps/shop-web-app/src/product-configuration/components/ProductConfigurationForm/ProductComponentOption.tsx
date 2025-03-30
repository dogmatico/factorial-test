import type {
	CategoryConfigurationRules,
	ComponentOption,
	ProductBreakdownValidator,
	Component as ProductComponent,
} from 'product-management-interfaces';
import React, { memo, useId, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProductComponentOptionPrice } from './ProductComponentOptionPrice';

export interface ProductComponentOptionProps {
	componentOption: ComponentOption;
	component: ProductComponent;
	validator: ProductBreakdownValidator;
}

export const ProductComponentOption = memo(function ProductComponentOption({
	componentOption,
	component,
	validator,
}: ProductComponentOptionProps) {
	const optionDescriptionId = useId();

	const { register } = useFormContext();

	const optionRules =
		validator.getRules().forbiddenRules.get(componentOption.id) ?? null;

	const rules = useMemo(() => {
		if (optionRules) {
			const forbiddenMap = new Map<string, string>();
			for (const rule of optionRules) {
				forbiddenMap.set(rule.option2Id, rule.value.message);
			}

			return {
				validate: (value, formValues) => {
					for (const selectedOptionId of Object.values(
						formValues.componentBreakdown,
					) as string[]) {
						const error = forbiddenMap.get(selectedOptionId);
						if (componentOption.id === value && error) {
							return error;
						}
					}

					return;
				},
			};
		}

		return {};
	}, [optionRules, componentOption.id]);

	return (
		<div className="shop-configuration-form-component-option">
			<label>
				<input
					type="radio"
					value={componentOption.id}
					aria-describedby={optionDescriptionId}
					{...register(`componentBreakdown.${component.id}`, rules)}
				/>

				{componentOption.name}
				<ProductComponentOptionPrice
					componentOption={componentOption}
					component={component}
					validator={validator}
				/>
			</label>

			<div id={optionDescriptionId}>{componentOption.description}</div>
		</div>
	);
});
