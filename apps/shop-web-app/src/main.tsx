import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SERVER_BASE_URL } from './contants';
import { routeTree } from './routeTree.gen';

// Set up a Router instance
export const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
});

// Register things for typesafety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

await fetch(`${SERVER_BASE_URL}/api/v1/shop/currentSession`, {
	method: 'POST',
});

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
