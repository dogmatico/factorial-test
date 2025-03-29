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

// Product Category
export const productCategory = sqliteTable(
	'product_category',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name', { length: 256 }).unique().notNull(),
		description: text('description'),
		isEnabled: integer('is_enabled', { mode: 'boolean' })
			.notNull()
			.default(true),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
			.$type<Date | string>(),
		displayOrder: integer('display_order').notNull().default(0),
	},
	(table) => [
		index('product_category_created_at_idx').on(table.createdAt),
		index('product_category_order_is_enabled_idx').on(
			table.displayOrder,
			table.isEnabled,
		),
	],
);

export type ProductCategory = typeof productComponent.$inferSelect;

// Product Component
export const productComponent = sqliteTable('product_component', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name', { length: 256 }).unique().notNull(),
	description: text('description'),
	isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
});

// Product Category Component (Junction Table)
export const productCategoryComponent = sqliteTable(
	'product_category_component',
	{
		productCategoryId: integer('product_category_id')
			.notNull()
			.references(() => productCategory.id, { onDelete: 'cascade' }),
		productComponentId: integer('product_component_id')
			.notNull()
			.references(() => productComponent.id, { onDelete: 'cascade' }),
		quantity: integer('quantity').notNull(),
		displayOrder: integer('display_order').notNull().default(0),
	},
	(table) => [
		primaryKey({
			columns: [table.productCategoryId, table.productComponentId],
		}),
		index('product_category_component_product_component_id_idx').on(
			table.productComponentId,
		),
		index('product_category_component_product_component_display_order_idx').on(
			table.productCategoryId,
			table.productComponentId,
			table.displayOrder,
		),
		check('quantity_check', sql`${table.quantity} >= 1`),
	],
);

// Product Component Option
export const productComponentOption = sqliteTable(
	'product_component_option',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name', { length: 256 }).unique().notNull(),
		description: text('description'),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		productComponentId: integer('product_component_id')
			.notNull()
			.references(() => productComponent.id, { onDelete: 'cascade' }),
		basePrice: real('base_price').notNull(),
	},
	(table) => [
		index('product_component_option_product_component_id_idx').on(
			table.productComponentId,
		),
		check('base_price_check', sql`${table.basePrice} >= 0`),
	],
);

// Product Component Option Rule
export const productComponentOptionRule = sqliteTable(
	'product_component_option_rule',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		productComponentOptionId1: integer('product_component_option_id_1')
			.notNull()
			.references(() => productComponentOption.id, { onDelete: 'cascade' }),
		productComponentOptionId2: integer('product_component_option_id_2')
			.notNull()
			.references(() => productComponentOption.id, { onDelete: 'cascade' }),
		kind: text('kind', { length: 256 }).notNull(),
		ruleValue: text('rule_value'),
	},
	(table) => [
		index('product_component_option_rule_parents_idx').on(
			table.productComponentOptionId1,
			table.productComponentOptionId2,
			table.kind,
		),
		check('kind_check', sql`${table.kind} IN ('SUPPLEMENT', 'FORBIDDEN')`),
		check(
			'check_ordering',
			sql`CHECK (${table.productComponentOptionId1} < ${table.productComponentOptionId2})`,
		),
	],
);

// Product Configuration
export const productConfiguration = sqliteTable('product_configuration', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name', { length: 256 }),
	description: text('description'),
	productComponentId: integer('product_component_id')
		.notNull()
		.references(() => productComponent.id, { onDelete: 'cascade' }),
	isBaseConfiguration: integer('is_base_configuration', { mode: 'boolean' })
		.notNull()
		.default(false),
});

// Product Configuration Component Option (Junction Table)
export const productConfigurationComponentOption = sqliteTable(
	'product_configuration_component_option',
	{
		productConfigurationId: integer('product_configuration_id')
			.notNull()
			.references(() => productConfiguration.id, { onDelete: 'cascade' }),
		productComponentOptionId: integer('product_component_option_id')
			.notNull()
			.references(() => productComponentOption.id, { onDelete: 'cascade' }),
		quantity: integer('quantity').notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.productConfigurationId, table.productComponentOptionId],
		}),
		check('check_quantity', sql`${table.quantity} >= 1`),
	],
);

// Customer Order
export const customerOrder = sqliteTable(
	'customer_order',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		customerId: integer('customer_id').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		orderStatus: text('order_status', { length: 256 }).notNull(),
		// SQLITE does not enforce precision, does not have proper decimal. By design should be 10.4
		totalPrice: real('total_price'),
	},
	(table) => [
		index('customer_order_customer_id').on(table.customerId),
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
