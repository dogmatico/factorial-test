import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

import { CheckoutPage } from '../order-checkout/pages/CheckoutPage';

export const Route = createFileRoute('/checkout')({
	component: RouteComponent,
});

function RouteComponent() {
	return <CheckoutPage />;
}
