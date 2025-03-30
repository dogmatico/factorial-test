import { sql } from 'drizzle-orm';
import {
	check,
	index,
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
} from 'drizzle-orm/sqlite-core';
import { productConfiguration } from '../../product-management/models/index.ts';

// Customer Order
export const customerOrder = sqliteTable(
	'customer_order',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		sessionId: text('session_id', { length: 36 }).notNull(),
		customerId: integer('customer_id').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		orderStatus: text('order_status', { length: 256 }).notNull(),
		// SQLITE does not enforce precision, does not have proper decimal. By design should be 10.4
		totalPrice: real('total_price'),
	},
	(table) => [
		index('customer_order_customer_id_idx').on(table.customerId),
		index('customer_order_session_id_status_idx').on(
			table.sessionId,
			table.orderStatus,
		),
		check(
			'order_status_enum',
			sql`${table.orderStatus} IN ('SESSION_ON_GOING', 'COMPLETED', 'CANCELLED')`,
		),
	],
);

// Customer Order Configuration (Junction Table)
export const customerOrderConfiguration = sqliteTable(
	'customer_order_configuration',
	{
		customerOrderId: integer('customer_order_id')
			.notNull()
			.references(() => customerOrder.id),
		productConfigurationId: integer('product_configuration_id')
			.notNull()
			.references(() => productConfiguration.id),
		purchasedCount: integer('purchased_count').notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.customerOrderId, table.productConfigurationId],
		}),
		index('customer_order_configuration_product_configuration_id_idx').on(
			table.productConfigurationId,
		),
		check('purchased_count', sql`${table.purchasedCount} >= 0`),
	],
);
