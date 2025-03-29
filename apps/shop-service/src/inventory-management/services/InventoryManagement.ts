import { eq, inArray } from 'drizzle-orm';

import {
	type ProductConfigurationService,
	getProductConfigurationService,
} from '../../product-management/services/ProductConfigurationService.ts';
import {
	type DBConnection,
	getDBConnection,
} from '../../shared/connections/database.ts';
import { availableInventory, inventory } from '../models/index.ts';

export interface GetAvailableInventoryOptions {
	/**
	 * Get available inventory for a session. It considers quotas plus overbooking
	 */
	sessionId?: string;
}

export interface GetSessionInventoryForProductOptions {
	maxUnits?: number;
}

export class InventoryManagementService {
	#db: DBConnection;
	#productConfigurationService: ProductConfigurationService;

	async getAvailableInventory(
		productOptionIds: string[],
		{ sessionId = '' }: GetAvailableInventoryOptions = {},
	) {
		const fetchOp = sessionId
			? this.#getSessionAvailableInventory(productOptionIds)
			: this.#getPhisicalInventory(productOptionIds);

		return (await fetchOp).reduce((acc, curr) => {
			acc[curr.productComponentOptionId] = curr.totalStock;

			return acc;
		}, {});
	}

	async getSessionInventoryForProductOptions(
		identifier: {
			id?: string;
			productName?: string;
		},
		_sessionId: string,
		{ maxUnits = 5 }: GetSessionInventoryForProductOptions = {},
	) {
		const config =
			await this.#productConfigurationService.getProductConfiguration(
				identifier,
			);

		const inventory = this.#getSessionAvailableInventory(
			Object.keys(config?.componentOptions ?? {}),
		);
		return (await inventory).reduce((acc, curr) => {
			acc[curr.productComponentOptionId] = Math.min(curr.totalStock, maxUnits);

			return acc;
		}, {});
	}

	constructor(
		db: DBConnection,
		productConfigurationService: ProductConfigurationService,
	) {
		this.#db = db;

		this.#productConfigurationService = productConfigurationService;
	}

	async #getPhisicalInventory(productOptionIds: string[]) {
		return this.#db
			.select()
			.from(inventory)
			.where(
				inArray(
					inventory.productComponentOptionId,
					productOptionIds.map((id) => Number.parseInt(id, 10)),
				),
			);
	}

	async #getSessionAvailableInventory(productOptionIds: string[]) {
		return this.#db
			.select()
			.from(availableInventory)
			.where(
				inArray(
					availableInventory.productComponentOptionId,
					productOptionIds.map((id) => Number.parseInt(id, 10)),
				),
			);
	}
}

let singletonInventoryManagementService: InventoryManagementService | null =
	null;
export function getInventoryManagementService() {
	if (!singletonInventoryManagementService) {
		const db = getDBConnection();
		const productConfigurationService = getProductConfigurationService();

		singletonInventoryManagementService = new InventoryManagementService(
			db,
			productConfigurationService,
		);
	}

	return singletonInventoryManagementService;
}
