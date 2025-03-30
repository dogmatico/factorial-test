import type {
	CategoryConfigurationRules,
	ForbiddenComponentRule,
	SupplementComponentRule,
} from './interfaces';

export interface PreprocessRulesOptions {
	// Sort rules by view model preference
	sortRules?: boolean;
}

export interface PreprocessRulesResult {
	supplementRules: Map<string, SupplementComponentRule[]>;
	forbiddenRules: Map<string, ForbiddenComponentRule[]>;
}

/**
 * Preprocess rules to wrap them into maps from the first option
 */
export function preprocessRules(
	config: CategoryConfigurationRules,
	{ sortRules = false }: PreprocessRulesOptions = {},
): PreprocessRulesResult {
	// Rules are order invariant respect options. However, on view models
	// is advantegous to have option1Id as the latest that will appear on screen.
	const optionIdPosition = new Map<string, number>();
	if (sortRules) {
		let counter = 0;
		for (const productId of config.category.productBreakDown) {
			for (const option1Id of config.components[productId].availableOptions) {
				optionIdPosition.set(option1Id, counter);
			}

			counter++;
		}
	}

	const supplementRules = new Map<string, SupplementComponentRule[]>();
	const forbiddenRules = new Map<string, ForbiddenComponentRule[]>();

	for (const rule of config.componentOptionsRules) {
		let { option1Id, option2Id } = rule;
		const option1Idx = optionIdPosition.get(option1Id) ?? 0;
		const option2Idx = optionIdPosition.get(option2Id) ?? 0;

		if (option1Idx < option2Idx) {
			[option2Id, option1Id] = [option1Id, option2Id];
		}

		if (rule.kind === 'SUPPLEMENT') {
			const prevSupplements = supplementRules.get(option1Id) ?? [];
			prevSupplements.push({ ...rule, option1Id, option2Id });
			supplementRules.set(option1Id, prevSupplements);
		}

		if (rule.kind === 'FORBIDDEN') {
			const prevForbRules = forbiddenRules.get(option1Id) ?? [];
			prevForbRules.push({ ...rule, option1Id, option2Id });

			forbiddenRules.set(option1Id, prevForbRules);
		}
	}

	return { supplementRules, forbiddenRules };
}
