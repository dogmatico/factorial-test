import { and, asc, eq } from 'drizzle-orm';
import {
	type DBConnection,
	getDBConnection,
} from '../../shared/connections/database.ts';
import type {
	CategoryConfigurationRules,
	ComponentOptionsRule,
	ForbiddenComponentRule,
	SupplementComponentRule,
} from '../interfaces.ts';
import {
	productCategory,
	productCategoryComponent,
	productComponent,
	productComponentOption,
	productComponentOptionRule,
} from '../models/index.ts';

export type ProductCategoryIdentifier = Partial<{
	id: string;
	productName: string;
}>;

export class ProductConfigurationService {
	#db: DBConnection;

	constructor(db: DBConnection) {
		this.#db = db;
	}

	/**
	 * Retrieve the configuration of a product category
	 */
	async getProductConfiguration({
		productName = '',
		id = '',
	}: ProductCategoryIdentifier): Promise<CategoryConfigurationRules | null> {
		if (!productName && !id) {
			throw new Error('Provide a name or id');
		}

		const queryResult = await this.#db
			.select()
			.from(productCategory)
			.innerJoin(
				productCategoryComponent,
				eq(productCategory.id, productCategoryComponent.productCategoryId),
			)
			.innerJoin(
				productComponent,
				eq(productComponent.id, productCategoryComponent.productComponentId),
			)
			.innerJoin(
				productComponentOption,
				eq(productComponent.id, productComponentOption.productComponentId),
			)
			.leftJoin(
				productComponentOptionRule,
				eq(
					productComponentOption.id,
					productComponentOptionRule.productComponentOptionId1,
				),
			)
			.where(
				and(
					id
						? eq(productCategory.id, Number.parseInt(id, 10))
						: eq(productCategory.name, productName),
					eq(productComponentOption.isActive, true),
				),
			)
			.orderBy(
				asc(productCategoryComponent.displayOrder),
				asc(productComponent.id),
				asc(productComponentOption.id),
			);

		if (queryResult.length) {
			const processedRulesIds = new Set<string>();

			const result: CategoryConfigurationRules = {
				category: {
					id: queryResult[0].product_category.id.toString(),
					name: queryResult[0].product_category.name,
					description: queryResult[0].product_category.description ?? '',
					productBreakDown: [],
				},
				components: {},
				componentOptions: {},
				componentOptionsRules: [],
			};

			for (const row of queryResult) {
				const {
					product_component,
					product_category_component,
					product_component_option,
					product_component_option_rule,
				} = row;

				const productComponentId = product_component.id.toString();
				if (!result.components[productComponentId]) {
					result.category.productBreakDown.push(productComponentId);

					result.components[productComponentId] = {
						id: productComponentId,
						name: product_component.name,
						requiredUnits: product_category_component.quantity,
						description: product_component.description ?? '',
						availableOptions: [],
					};
				}

				const productComponentOptionId = product_component_option.id.toString();
				if (!result.componentOptions[productComponentOptionId]) {
					result.componentOptions[productComponentOptionId] = {
						id: productComponentOptionId,
						name: product_component_option.name,
						description: product_component_option.description ?? '',
						basePrice: product_component_option.basePrice,
					};

					result.components[productComponentId].availableOptions.push(
						productComponentOptionId,
					);
				}

				const ruleId = product_component_option_rule?.id.toString();
				if (
					product_component_option_rule &&
					ruleId &&
					!processedRulesIds.has(ruleId)
				) {
					result.componentOptionsRules.push({
						id: ruleId,
						option1Id:
							product_component_option_rule.productComponentOptionId1.toString(),
						option2Id:
							product_component_option_rule.productComponentOptionId2.toString(),
						kind: product_component_option_rule.kind as ComponentOptionsRule['kind'],
						value: JSON.parse(product_component_option_rule.ruleValue ?? '{}'),
					});

					processedRulesIds.add(ruleId);
				}
			}

			return result;
		}

		return null;
	}

	async avaluateProductConfigurationBreakdown(
		identifier: ProductCategoryIdentifier,
		productComponentBreakdown: Record<string, number>,
	) {
		const config = await this.getProductConfiguration(identifier);
		if (!config) {
			return {
				isValid: false,
				breakdownPrice: 0,
				errors: ['Configuration not found'],
			};
		}

		let breakdownPrice = 0;
		const { componentOptionToComponent, componentMissingOptionCount } =
			Object.values(config.components).reduce(
				(acc, curr) => {
					acc.componentMissingOptionCount.set(curr.id, curr.requiredUnits);

					for (const optionId of curr.availableOptions) {
						acc.componentOptionToComponent.set(optionId, curr.id);
					}

					return acc;
				},
				{
					componentOptionToComponent: new Map<string, string>(),
					componentMissingOptionCount: new Map<string, number>(),
				},
			);

		const { supplementRules, forbiddenRules } =
			config.componentOptionsRules.reduce(
				(acc, curr) => {
					// Data integrity ensures that each kind of rule is unique per pair, and order invariant

					if (curr.kind === 'SUPPLEMENT') {
						const prevSupplements =
							acc.supplementRules.get(curr.option1Id) ?? [];
						prevSupplements.push(curr);
						acc.supplementRules.set(curr.option1Id, prevSupplements);
					}

					if (curr.kind === 'FORBIDDEN') {
						const prevForbRules = acc.forbiddenRules.get(curr.option1Id) ?? [];
						prevForbRules.push(curr);

						acc.forbiddenRules.set(curr.option1Id, prevForbRules);
					}

					return acc;
				},
				{
					supplementRules: new Map<string, SupplementComponentRule[]>(),
					forbiddenRules: new Map<string, ForbiddenComponentRule[]>(),
				},
			);

		const errors: string[] = [];
		for (const [optionId, units] of Object.entries(productComponentBreakdown)) {
			const componentId = componentOptionToComponent.get(optionId);
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

			let unitaryPrice = config.componentOptions[optionId]?.basePrice ?? 0;
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
						config.components[componentId]?.name
					}`,
				);
			} else if (missingCount > 0) {
				errors.push(
					`Missing ${missingCount} units for component ${config.components[componentId]?.name}`,
				);
			}
		}

		return {
			isValid: errors.length === 0 && breakdownPrice >= 0,
			breakdownPrice,
			errors,
		};
	}
}

let singletonProductConfigurationService: ProductConfigurationService | null =
	null;
export function getProductConfigurationService() {
	if (!singletonProductConfigurationService) {
		const db = getDBConnection();
		singletonProductConfigurationService = new ProductConfigurationService(db);
	}

	return singletonProductConfigurationService;
}
