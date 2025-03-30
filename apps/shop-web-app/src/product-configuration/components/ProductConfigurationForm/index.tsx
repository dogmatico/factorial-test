import {
	type CategoryConfigurationRules,
	ProductBreakdownValidator,
} from 'product-management-interfaces';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ProductConfigurationActionBarExtraActionWrapper } from '../ProductConfigurationActionBar';
import { CategoryConfigurationComponentSection } from './CategoryConfigurationComponentSection';
import { TotalConfigurationPrice } from './TotalConfigurationPrice';

const noOp = () => {};

export interface OnSubmitCategoryProductConfigurationFormPayload {
	configurationId: string;
	productCategoryId: string;
	componentBreakdown: Record<string, number>;
}

export interface CategoryProductConfigurationFormProps {
	configuration: CategoryConfigurationRules;
	formId?: string;
	onSubmit?: (payload: OnSubmitCategoryProductConfigurationFormPayload) => void;
}

export const CategoryProductConfiguration = memo(
	function CategoryProductConfiguration({
		configuration,
		onSubmit: _onSubmit = noOp,
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

		const [configurationId] = useState<string>(() =>
			globalThis.crypto.randomUUID(),
		);

		const methods = useForm({ defaultValues });

		const validator = useMemo(() => {
			return new ProductBreakdownValidator(configuration, { sortRules: true });
		}, [configuration]);

		const onSubmit = useCallback(
			(val: { componentBreakdown: Record<string, string> }) => {
				const selectedOptionsBreakdown = Object.fromEntries(
					Object.values(val.componentBreakdown).map((id) => [id, 1]),
				);

				_onSubmit({
					configurationId,
					componentBreakdown: selectedOptionsBreakdown,
					productCategoryId: configuration.category.id,
				});
			},
			[_onSubmit, configurationId, configuration.category.id],
		);

		return (
			<FormProvider {...methods}>
				<form
					data-testid="category-product-configuration-form"
					id={formId}
					onSubmit={methods.handleSubmit(onSubmit)}
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
