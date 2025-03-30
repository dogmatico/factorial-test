import { sql } from 'drizzle-orm';
import {
	type DBConnection,
	getDBConnection,
} from '../../shared/connections/database.ts';
import { toInt } from '../../shared/helpers/toInt.ts';
import { customerOrder, customerOrderConfiguration } from '../models/index.ts';

export class OrderManagementService {
	#db: DBConnection;

	constructor(db: DBConnection) {
		this.#db = db;
	}

	async createSessionOrder(sessionId: string, customerId: number) {
		return this.#db.transaction((tx) =>
			tx
				.insert(customerOrder)
				.values({
					customerId,
					sessionId,
					orderStatus: 'SESSION_ON_GOING',
					totalPrice: 0,
				})
				.onConflictDoNothing()
				.returning({ insertedId: customerOrder.id })
				.then((res) => res[0]),
		);
	}

	async addConfigurationToOrder(
		configurationId: number,
		orderId: string | number,
		purchasedCount = 1,
	) {
		return this.#db.transaction((tx) =>
			tx
				.insert(customerOrderConfiguration)
				.values({
					customerOrderId: toInt(orderId),
					productConfigurationId: configurationId,
					purchasedCount,
				})
				.onConflictDoUpdate({
					target: [
						customerOrderConfiguration.customerOrderId,
						customerOrderConfiguration.productConfigurationId,
					],
					set: {
						purchasedCount: sql`${customerOrderConfiguration.purchasedCount} + ${purchasedCount}`,
					},
				}),
		);
	}
}

let orderManagementServiceSingleton: OrderManagementService | null = null;

export function getOrderManagementService() {
	if (!orderManagementServiceSingleton) {
		const db = getDBConnection();

		orderManagementServiceSingleton = new OrderManagementService(db);
	}

	return orderManagementServiceSingleton;
}
