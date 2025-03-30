import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import * as React from 'react';

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<div className="shop-page-nav-bar">
				<Link
					to="/"
					className="shop-page-nav-bar-link"
					activeProps={{
						className: 'shop-page-nav-bar-link--active',
					}}
					activeOptions={{ exact: true }}
				>
					Home
				</Link>{' '}
				<Link
					to="/shop/$productCategoryName"
					params={{ productCategoryName: 'Bicycles' }}
					className="shop-page-nav-bar-link"
					activeProps={{
						className: 'shop-page-nav-bar-link--active',
					}}
				>
					Buy a Bicycle
				</Link>{' '}
			</div>
			<hr />
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
}
