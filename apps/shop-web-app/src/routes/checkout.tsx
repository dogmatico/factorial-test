import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import React from 'react';

import { SERVER_BASE_URL } from '../contants';
import { CheckoutPage } from '../order-checkout/pages/CheckoutPage';

export const Route = createFileRoute('/checkout')({
	component: RouteComponent,
	loader: async () => {
		return fetch(`${SERVER_BASE_URL}/api/v1/shop/chart/configuration`).then(
			(res) => res.json(),
		);
	},
});

function RouteComponent() {
	const sessionOrder = Route.useLoaderData();

	return <CheckoutPage sessionOrder={sessionOrder} />;
}
