import React, { memo } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

export interface CategoryConfigurationErrorOutlet {
	productComponentId: string;
	id: string;
}
export const CategoryConfigurationErrorOutlet = memo(
	function CategoryConfigurationErrorOutlet({
		productComponentId,
		id,
	}: CategoryConfigurationErrorOutlet) {
		const { control } = useFormContext();
		const { errors } = useFormState({
			control,
			name: `componentBreakdown.${productComponentId}`,
		});

		if (errors?.componentBreakdown?.[productComponentId]) {
			return (
				<ul id={id} role="alert">
					<li>{errors?.componentBreakdown?.[productComponentId]?.message}</li>
				</ul>
			);
		}

		return null;
	},
);
