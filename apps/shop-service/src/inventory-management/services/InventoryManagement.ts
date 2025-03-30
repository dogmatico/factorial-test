import { inArray, sql } from 'drizzle-orm';

import {
	type ProductConfigurationService,
	getProductConfigurationService,
} from '../../product-management/services/ProductConfigurationService.ts';
import { getLocalId } from '../../product-management/utils/global-ids.ts';
import {
	type DBConnection,
	getDBConnection,
} from '../../shared/connections/database.ts';
import { toInt } from '../../shared/helpers/toInt.ts';
import {
	availableInventory,
	inventory,
	inventoryReservation,
} from '../models/index.ts';

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
			Object.keys(config?.componentOptions ?? {}).map((globalId) =>
				getLocalId(globalId),
			),
		);
		return (await inventory).reduce((acc, curr) => {
			acc[curr.productComponentOptionId] = Math.min(curr.totalStock, maxUnits);

			return acc;
		}, {});
	}

	async reserveInventoryForSession(
		sessionId: string,
		componentOptionsBreakdown: Record<string | number, number>,
	) {
		return this.#db.transaction(async (tx) => {
			const availableUnit = this.#aggregateToInventoryObject(
				await tx
					.select()
					.from(availableInventory)
					.where(
						inArray(
							availableInventory.productComponentOptionId,
							Object.keys(componentOptionsBreakdown).map((id) => toInt(id)),
						),
					),
			);

			const missingInventoryId: string[] = [];
			for (const [id, requiredUnits] of Object.entries(
				componentOptionsBreakdown,
			)) {
				if (availableUnit[id] < requiredUnits) {
					missingInventoryId.push(id);
				}
			}

			if (missingInventoryId.length) {
				return { success: false };
			}

			// 12 minutes
			const expiresAt = new Date(Date.now() + 12 * 1000 * 60);
			// We don't have proper excluded at SQLite, so we will be adding one by one
			for (const [productComponentOptionId, reservedUnits] of Object.entries(
				componentOptionsBreakdown,
			)) {
				await tx
					.insert(inventoryReservation)
					.values({
						createdAt: new Date(),
						expiresAt,
						sessionId,
						productComponentOptionId: toInt(productComponentOptionId),
						reservedUnits,
					})
					.onConflictDoUpdate({
						target: [
							inventoryReservation.sessionId,
							inventoryReservation.productComponentOptionId,
						],
						set: {
							reservedUnits: sql`${inventoryReservation.reservedUnits} + ${reservedUnits}`,
						},
					});
			}

			return { sucess: true };
		});
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

	#aggregateToInventoryObject(
		rows: {
			productComponentOptionId: number;
			totalStock: number;
			productCategoryId?: number;
		}[],
		maxUnits: number = Number.POSITIVE_INFINITY,
	): Record<string, number> {
		return rows.reduce((acc, curr) => {
			acc[curr.productComponentOptionId] = Math.min(curr.totalStock, maxUnits);

			return acc;
		}, {});
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
