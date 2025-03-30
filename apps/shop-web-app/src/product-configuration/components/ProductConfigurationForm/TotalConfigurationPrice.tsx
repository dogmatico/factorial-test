import type { ProductBreakdownValidator } from 'product-management-interfaces';
import React, { memo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormatPrice } from './FormatPrice';
import { useGetPriceFromFormValues } from './useGetPriceFromFormValues';

export interface TotalConfigurationPriceProps {
	validator: ProductBreakdownValidator;
}

export const TotalConfigurationPrice = memo(function TotalConfigurationPrice({
	validator,
}: TotalConfigurationPriceProps) {
	const { control } = useFormContext();

	const componentBreakdown = useWatch({ control, name: 'componentBreakdown' });
	const price = useGetPriceFromFormValues({ componentBreakdown }, validator);

	return (
		<span>
			Total price <FormatPrice price={price} />
		</span>
	);
});
