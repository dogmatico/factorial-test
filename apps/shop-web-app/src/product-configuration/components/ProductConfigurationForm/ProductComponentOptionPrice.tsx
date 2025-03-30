import {
	CategoryConfigurationRules,
	type ComponentOption,
	type ProductBreakdownValidator,
	type Component as ProductComponent,
} from 'product-management-interfaces';
import React, { memo, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export interface ProductComponentOptionPriceProps {
	componentOption: ComponentOption;
	component: ProductComponent;
	validator: ProductBreakdownValidator;
}

const emptyArray = [];

export const ProductComponentOptionPrice = memo(
	function ProductComponentOptionPrice({
		validator,
		component,
		componentOption,
	}: ProductComponentOptionPriceProps) {
		const { control } = useFormContext();

		const supplementRules =
			validator.getRules().supplementRules.get(componentOption.id) ??
			emptyArray;

		const supplements = useMemo(() => {
			const supplementMap = new Map<string, number>();
			if (supplementRules) {
				for (const supplement of supplementRules) {
					supplementMap.set(
						supplement.option2Id,
						supplement.value.price_adjustment,
					);
				}
			}

			return supplementMap;
		}, [supplementRules]);

		const componentsToObserve = useMemo(() => {
			const valueNames: string[] = [`componentBreakdown.${component.id}`];

			for (const rule of supplementRules) {
				valueNames.push(
					`componentBreakdown.${validator.getComponentOptionIdToComponentId(rule.option2Id)}`,
				);
			}

			return valueNames;
		}, [supplementRules, validator, component.id]);

		const selectedOptions = useWatch({ control, name: componentsToObserve });
		const price = useMemo(() => {
			const [_curr, ...other] = selectedOptions;

			let result = componentOption.basePrice;
			for (const otherProductOptionsId of other) {
				result += supplements.get(otherProductOptionsId) ?? 0;
			}

			return Intl.NumberFormat('en', {
				style: 'currency',
				currency: 'EUR',
			}).format(result);
		}, [selectedOptions, supplements, componentOption]);

		return (
			<div className="shop-configuration-form-component-option-price">
				{price}
			</div>
		);
	},
);
