import React, { memo } from 'react';

export interface CheckoutPageProps {
	sessionOrder: Record<string, string>;
}

export const CheckoutPage = memo(function CheckoutPage({
	sessionOrder,
}: CheckoutPageProps) {
	return (
		<section>
			<header>Checkout</header>
			<textarea readOnly style={{ width: '100vw', height: '100vh' }}>
				{JSON.stringify(sessionOrder, null, 2)}
			</textarea>
		</section>
	);
});
