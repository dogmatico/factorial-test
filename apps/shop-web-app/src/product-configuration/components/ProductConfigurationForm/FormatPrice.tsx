import { memo, useMemo } from 'react';

export interface FormatPriceProps {
	price: number;
}
export const FormatPrice = memo(function FormatPrice({
	price,
}: FormatPriceProps) {
	const formatter = useMemo(() => {
		return Intl.NumberFormat('en', {
			style: 'currency',
			currency: 'EUR',
		});
	}, []);

	return formatter.format(price);
});
