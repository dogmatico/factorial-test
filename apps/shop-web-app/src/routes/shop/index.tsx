import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/shop/')({
	component: RouteComponent,
	beforeLoad: () => {
		throw redirect({
			to: '/shop/$productCategoryName',
			params: { productCategoryName: 'Bicycles' },
		});
	},
});

function RouteComponent() {
	return null;
}
