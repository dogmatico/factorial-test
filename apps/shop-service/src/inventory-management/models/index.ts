import { sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	primaryKey,
	sqliteTable,
	sqliteView,
	text,
} from 'drizzle-orm/sqlite-core';

import {
	productCategory,
	productCategoryComponent,
	productComponent,
	productComponentOption,
} from '../../product-management/models/index.ts';

// Inventory
export const inventory = sqliteTable(
	'inventory',
	{
		productComponentOptionId: integer('product_component_option_id')
			.notNull()
			.references(() => productComponentOption.id)
			.primaryKey(),
		totalStock: integer('total_stock').notNull(),
	},
	(table) => {
		return [check('total_stock', sql`${table.totalStock} >= 0`)];
	},
);

// Inventory Reservation
export const inventoryReservation = sqliteTable(
	'inventory_reservation',
	{
		sessionId: text('session_id', { length: 36 }).notNull(),
		productComponentOptionId: integer('product_component_option_id')
			.notNull()
			.references(() => productComponentOption.id, { onDelete: 'cascade' }),
		reservedUnits: integer('reserved_units').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.sessionId, table.productComponentOptionId] }),
		index('expires_at_idx').on(table.expiresAt),
		check('reserved_units', sql`${table.reservedUnits} >= 0`),
	],
);

// Available Inventory View
export const availableInventory = sqliteView('available_inventory').as((qb) => {
	return qb
		.select({
			productComponentOptionId: inventory.productComponentOptionId,
			totalStock: sql<number>`
						(CAST(1.10 * ${inventory.totalStock} AS INTEGER) - 
						COALESCE(
							(SELECT SUM(${inventoryReservation.reservedUnits}) 
							FROM ${inventoryReservation} 
							WHERE ${inventoryReservation.productComponentOptionId} = ${inventory.productComponentOptionId}
							AND ${inventoryReservation.expiresAt} > (unixepoch('now') * 1000)
						, 0)
					`.as('total_stock'),
		})
		.from(inventory)
		.innerJoin(
			productComponentOption,
			sql`${inventory.productComponentOptionId} = ${productComponentOption.id}`,
		)
		.innerJoin(
			productComponent,
			sql`${productComponentOption.productComponentId} = ${productComponent.id}`,
		)
		.innerJoin(
			productCategoryComponent,
			sql`${productComponent.id} = ${productCategoryComponent.productComponentId}`,
		)
		.groupBy(inventory.productComponentOptionId, inventory.totalStock);
});
