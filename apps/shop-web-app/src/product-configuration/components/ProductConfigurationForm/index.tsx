import {
	type CategoryConfigurationRules,
	ProductBreakdownValidator,
} from 'product-management-interfaces';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ProductConfigurationActionBarExtraActionWrapper } from '../ProductConfigurationActionBar';
import { CategoryConfigurationComponentSection } from './CategoryConfigurationComponentSection';
import { TotalConfigurationPrice } from './TotalConfigurationPrice';
import { useGetPriceFromFormValues } from './useGetPriceFromFormValues';

const noOp = () => {};

export interface CategoryProductConfigurationFormProps {
	configuration: CategoryConfigurationRules;
	formId?: string;
	onSubmit?: (productBreakdown: {
		componentBreakdown: Record<string, string>;
	}) => void;
	onChange?: (productBreakdown: {
		componentBreakdown: Record<string, string>;
	}) => void;
	onPriceChange?: (newPrice: number) => void;
}

export const CategoryProductConfiguration = memo(
	function CategoryProductConfiguration({
		configuration,
		onSubmit = noOp,
		onChange: _onChange,
		onPriceChange = noOp,
		formId = 'category-product-configuration-form',
	}: CategoryProductConfigurationFormProps) {
		// For demo, although server supports multi-unit per option, we wil assume a single unit
		const defaultValues = useMemo(() => {
			const value = {
				componentBreakdown: {},
			};
			for (const componentId of configuration.category.productBreakDown) {
				const componentDef = configuration.components[componentId];
				const firstAvailableOption =
					configuration.componentOptions[componentDef.availableOptions[0]];

				value.componentBreakdown[componentId] = firstAvailableOption.id;
			}
			return value;
		}, [configuration]);

		const methods = useForm({ defaultValues });

		const validator = useMemo(() => {
			return new ProductBreakdownValidator(configuration, { sortRules: true });
		}, [configuration]);

		const lastPrice = useRef<number>();
		const currentPrice = useGetPriceFromFormValues(
			methods.getValues(),
			validator,
		);
		if (lastPrice.current !== currentPrice && onPriceChange) {
			onPriceChange(currentPrice);
		}

		const onChange = useCallback(() => {
			const values = methods.getValues();

			if (_onChange) {
				_onChange(values);
			}
		}, [methods.getValues, _onChange]);

		return (
			<FormProvider {...methods}>
				<form
					data-testid="category-product-configuration-form"
					id={formId}
					onSubmit={methods.handleSubmit(onSubmit)}
					onChange={onChange}
				>
					{configuration.category.productBreakDown.map((componentId) => {
						return (
							<CategoryConfigurationComponentSection
								key={componentId}
								componentId={componentId}
								configuration={configuration}
								validator={validator}
							/>
						);
					})}
					<ProductConfigurationActionBarExtraActionWrapper>
						<TotalConfigurationPrice validator={validator} />
					</ProductConfigurationActionBarExtraActionWrapper>
				</form>
			</FormProvider>
		);
	},
);
