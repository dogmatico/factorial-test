import { and, asc, eq } from 'drizzle-orm';
import {
	type CategoryConfigurationRules,
	type ComponentOptionsRule,
	ProductBreakdownValidator,
	preprocessRules,
} from 'product-management-interfaces';
import {
	type DBConnection,
	getDBConnection,
} from '../../shared/connections/database.ts';

import {
	productCategory,
	productCategoryComponent,
	productComponent,
	productComponentOption,
	productComponentOptionRule,
} from '../models/index.ts';
import { makeGlobalId } from '../utils/global-ids.ts';

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

				const productComponentId = makeGlobalId(
					'ProductComponent',
					product_component.id.toString(),
				);
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

				const productComponentOptionId = makeGlobalId(
					'ComponentOption',
					product_component_option.id.toString(),
				);
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

				const ruleId = product_component_option_rule?.id
					? makeGlobalId(
							'ProductComponentRule',
							product_component_option_rule.id.toString(),
						)
					: null;
				if (
					product_component_option_rule &&
					ruleId &&
					!processedRulesIds.has(ruleId)
				) {
					result.componentOptionsRules.push({
						id: ruleId,
						option1Id: makeGlobalId(
							'ComponentOption',
							product_component_option_rule.productComponentOptionId1.toString(),
						),
						option2Id: makeGlobalId(
							'ComponentOption',
							product_component_option_rule.productComponentOptionId2.toString(),
						),
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

		const validator = new ProductBreakdownValidator(config);
		return validator.validateProductBreakdown(productComponentBreakdown);
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
