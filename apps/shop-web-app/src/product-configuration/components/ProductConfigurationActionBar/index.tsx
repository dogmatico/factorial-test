import React, { memo } from 'react';

export interface ProductConfigurationActionBarProps {
	formId?: string;
}

export const ProductConfigurationActionBar = memo(
	function ProductConfigurationActionBar({
		formId = 'category-product-configuration-form',
	}: ProductConfigurationActionBarProps) {
		return (
			<footer className="shop-configuration-page-footer">
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
