export interface ProductCategory {
	id: string;
	name: string;
	description: string;

	// Ordered list of component IDs
	productBreakDown: string[];
}

export interface Component {
	id: string;
	name: string;
	description: string;

	requiredUnits: number;

	// IDs of available options for this component
	availableOptions: string[];
}

export interface ComponentOption {
	id: string;
	name: string;
	description: string;

	// Base price of the option (using numbers for simplicity, but should handle decimals)
	basePrice: number;
}

interface BaseComponentOptionsRule {
	id: string;
	// Base of tagged union by Kind
	kind: string;

	// Rule applies to a pair of options
	option1Id: string;
	option2Id: string;
}

export interface SupplementComponentRule extends BaseComponentOptionsRule {
	kind: 'SUPPLEMENT';

	value: {
		price_adjustment: number;
		message: string;
	};
}

export interface ForbiddenComponentRule extends BaseComponentOptionsRule {
	kind: 'FORBIDDEN';

	value: {
		inverse?: boolean;
		message: string;
	};
}

export type ComponentOptionsRule =
	| SupplementComponentRule
	| ForbiddenComponentRule;

export interface CategoryConfigurationRules {
	category: ProductCategory;
	components: Record<string, Component>;
	componentOptions: Record<string, ComponentOption>;
	componentOptionsRules: ComponentOptionsRule[];
}
