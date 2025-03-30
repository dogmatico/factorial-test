import type { ProductBreakdownValidator } from 'product-management-interfaces';

export function useGetPriceFromFormValues<
	T extends { componentBreakdown: Record<string, string> },
>({ componentBreakdown }: T, validator: ProductBreakdownValidator) {
	const selectedOptionsBreakdown = Object.fromEntries(
		Object.values(componentBreakdown).map((id) => [id, 1]),
	);

	return validator.validateProductBreakdown(selectedOptionsBreakdown)
		.breakdownPrice;
}
