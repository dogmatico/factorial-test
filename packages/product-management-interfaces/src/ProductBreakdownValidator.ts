import type { CategoryConfigurationRules } from './interfaces';
import {
	type PreprocessRulesOptions,
	type PreprocessRulesResult,
	preprocessRules,
} from './preprocessRules.ts';

export class ProductBreakdownValidator {
	#config: CategoryConfigurationRules;

	#rules: PreprocessRulesResult;

	#componentOptionToComponent: Map<string, string>;
	#requiredComponentCount: Map<string, number>;

	constructor(
		config: CategoryConfigurationRules,
		options: PreprocessRulesOptions = {},
	) {
		this.#config = config;

		this.#rules = preprocessRules(this.#config, options);

		this.#precomputeValidationMaps();
	}

	getRules(): PreprocessRulesResult {
		return this.#rules;
	}

	getComponentOptionIdToComponentId(componentOptionId) {
		return this.#componentOptionToComponent.get(componentOptionId);
	}

	validateProductBreakdown(productComponentBreakdown: Record<string, number>) {
		let breakdownPrice = 0;
		const componentMissingOptionCount = new Map(this.#requiredComponentCount);
		const { supplementRules, forbiddenRules } = this.getRules();

		const errors: string[] = [];
		for (const [optionId, units] of Object.entries(productComponentBreakdown)) {
			const componentId = this.#componentOptionToComponent.get(optionId);
			if (componentId == null) {
				errors.push(
					`Option with id ${optionId} is not part of the product breakdown`,
				);
				continue;
			}

			if (units < 1) {
				errors.push(
					`The unit count of ${optionId} is non stricty positive number`,
				);
				continue;
			}

			const stillMissingUnitCount =
				componentMissingOptionCount.get(componentId);
			if (stillMissingUnitCount) {
				componentMissingOptionCount.set(
					componentId,
					stillMissingUnitCount - units,
				);
			}

			let unitaryPrice =
				this.#config.componentOptions[optionId]?.basePrice ?? 0;
			const supplements = supplementRules.get(optionId);
			if (supplements) {
				for (const supplement of supplements) {
					if (productComponentBreakdown[supplement.option2Id] != null) {
						unitaryPrice += supplement.value.price_adjustment;
					}
				}
			}

			breakdownPrice += units * unitaryPrice;

			// Check forbidden combos
			const optionForbiddenRules = forbiddenRules.get(optionId);
			if (optionForbiddenRules) {
				for (const rule of optionForbiddenRules) {
					if (productComponentBreakdown[rule.option2Id] != null) {
						errors.push(`Invalid combination: ${rule.value.message}`);
					}
				}
			}
		}

		for (const [
			componentId,
			missingCount,
		] of componentMissingOptionCount.entries()) {
			if (missingCount < 0) {
				errors.push(
					`Provided ${-missingCount} units in excess for component ${
						this.#config.components[componentId]?.name
					}`,
				);
			} else if (missingCount > 0) {
				errors.push(
					`Missing ${missingCount} units for component ${this.#config.components[componentId]?.name}`,
				);
			}
		}

		return {
			isValid: errors.length === 0 && breakdownPrice >= 0,
			breakdownPrice,
			errors,
		};
	}

	#precomputeValidationMaps() {
		this.#componentOptionToComponent = new Map();
		this.#requiredComponentCount = new Map();

		for (const component of Object.values(this.#config.components)) {
			this.#requiredComponentCount.set(component.id, component.requiredUnits);

			for (const optionId of component.availableOptions) {
				this.#componentOptionToComponent.set(optionId, component.id);
			}
		}
	}
}
