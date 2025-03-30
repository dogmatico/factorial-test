import React, { memo, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export interface ProductConfigurationActionBarProps {
	formId?: string;
}

function makeExtraActionsOutletId(formId: string) {
	return `${formId}__extra-actions-outlet`;
}

export const ProductConfigurationActionBar = memo(
	function ProductConfigurationActionBar({
		formId = 'category-product-configuration-form',
	}: ProductConfigurationActionBarProps) {
		return (
			<footer className="shop-configuration-page-footer">
				<div id={makeExtraActionsOutletId(formId)} />
				<button
					type="submit"
					form={formId}
					className="shop-configuration-page-footer-action shop-configuration-page-footer-action--main"
				>
					Add to chart
				</button>
			</footer>
		);
	},
);

export const ProductConfigurationActionBarExtraActionWrapper = memo(
	function ProductConfigurationActionBarExtraActionWrapper({
		children,
		formId = 'category-product-configuration-form',
	}: PropsWithChildren<ProductConfigurationActionBarProps>) {
		const host = document.getElementById(makeExtraActionsOutletId(formId));
		return host ? createPortal(children, host) : null;
	},
);
