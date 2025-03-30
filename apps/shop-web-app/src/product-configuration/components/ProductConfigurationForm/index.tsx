import {
	type CategoryConfigurationRules,
	ProductBreakdownValidator,
} from 'product-management-interfaces';
import React, { memo, useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CategoryConfigurationComponentSection } from './CategoryConfigurationComponentSection';

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
}

export const CategoryProductConfiguration = memo(
	function CategoryProductConfiguration({
		configuration,
		onSubmit = noOp,
		onChange: _onChange,
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

		const onChange = useCallback(() => {
			if (_onChange) {
				_onChange(methods.getValues());
			}
		}, [methods.getValues, _onChange]);

		const validator = useMemo(() => {
			return new ProductBreakdownValidator(configuration, { sortRules: true });
		}, [configuration]);

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
				</form>
			</FormProvider>
		);
	},
);
