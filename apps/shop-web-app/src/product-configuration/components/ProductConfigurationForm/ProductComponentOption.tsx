import type {
	ComponentOption,
	Component as ProductComponent,
} from 'product-management-interfaces';
import React, { memo, useId } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ProductComponentOptionProps {
	componentOption: ComponentOption;
	component: ProductComponent;
}

export const ProductComponentOption = memo(function ProductComponentOption({
	componentOption,
	component,
}: ProductComponentOptionProps) {
	const optionDescriptionId = useId();

	const { register } = useFormContext();

	return (
		<div className="shop-configuration-form-component-option">
			<label>
				<input
					type="radio"
					value={componentOption.id}
					aria-describedby={optionDescriptionId}
					{...register(`componentBreakdown.${component.id}`)}
				/>
				{componentOption.name}
			</label>

			<div id={optionDescriptionId}>{componentOption.description}</div>
		</div>
	);
});
