-- sqlite3 compatible schema for demo

-- Has performance impact, OK for demo, or low requirements
-- PRAGMA foreign_keys = ON;

CREATE TABLE product_category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- This unique is to use it on the view, to produce good looking URL without a lookup
  name VARCHAR(256) UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX product_category_created_at_idx ON product_category(created_at);

-- To provide the view for the main product page
CREATE INDEX product_category_order_is_enabled_idx ON product_category(display_order, is_enabled);

CREATE TABLE product_component (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(256) UNIQUE NOT NULL,
  description TEXT,

  -- Logic to soft delete. Hard delete can cause data loss and inconsistencies with orders and
  -- inventories
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- Many to many relation categories and components
CREATE TABLE product_category_component (
  product_category_id INT NOT NULL,
  product_component_id INT NOT NULL,
  quantity INT CHECK (quantity >= 1),

  display_order INT NOT NULL DEFAULT 0,

  PRIMARY KEY (product_category_id, product_component_id),
  -- We can remove part of this if data cardinality was higher to remove constraints on the database
  FOREIGN KEY (product_category_id) REFERENCES product_category(id) ON DELETE CASCADE,
  FOREIGN KEY (product_component_id) REFERENCES product_component(id) ON DELETE CASCADE
) WITHOUT ROWID;

CREATE INDEX product_category_component_product_component_display_order_idx ON product_category_component(product_category_id, product_component_id, display_order);
CREATE INDEX product_category_component_product_component_display_order_idx_2 ON product_category_component(display_order, product_component_id, product_category_id);
CREATE INDEX product_category_component_product_component_id_idx ON product_category_component(product_component_id);
CREATE INDEX product_category_component_order_optimized_idx ON product_category_component(product_category_id, display_order, product_component_id);

CREATE TABLE product_component_option (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(256) UNIQUE NOT NULL,
  description TEXT,

  -- Prioritize over delete to prevent cascade loss of data
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- One to many relation
  product_component_id INT NOT NULL,

  -- Storing four decimals, as top is three plus 1
  base_price DECIMAL(10, 4) NOT NULL CHECK (base_price >= 0),
  FOREIGN KEY (product_component_id) REFERENCES product_component(id) ON DELETE CASCADE
);

CREATE INDEX product_component_option_product_component_id_idx ON product_component_option(product_component_id);

CREATE TABLE product_component_option_rule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_component_option_id_1 INT NOT NULL,
  product_component_option_id_2 INT NOT NULL,
  -- We could use an enum, but that can produce another table if not supported natively by the SQL engine
  kind VARCHAR(256) NOT NULL CHECK (kind IN ('SUPPLEMENT', 'FORBIDDEN')),
  -- Consumer will cast it depending on the kind
  rule_value TEXT,
  FOREIGN KEY (product_component_option_id_1) REFERENCES product_component_option(id) ON DELETE CASCADE,
  FOREIGN KEY (product_component_option_id_2) REFERENCES product_component_option(id) ON DELETE CASCADE,
  -- This with the unique index will ensure no duplicate rules of the same kind, plus rules on itself
  CONSTRAINT check_ordering CHECK (product_component_option_id_1 < product_component_option_id_2)
);

CREATE UNIQUE INDEX product_component_option_rule_parents_idx
  ON product_component_option_rule(product_component_option_id_1, product_component_option_id_2, kind);

CREATE TABLE product_configuration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(256),
  description TEXT,
  product_component_id INT NOT NULL,

  -- We can use it to differentiate customer from base configuration without duplicating tables
  is_base_configuration BOOLEAN NOT NULL DEFAULT FALSE,

  FOREIGN KEY (product_component_id) REFERENCES product_component(id) ON DELETE CASCADE
);

-- Many to many relation
CREATE TABLE product_configuration_component_option (
  product_configuration_id INT NOT NULL,
  product_component_option_id INT NOT NULL,
  quantity INT CHECK (quantity >= 1),
  PRIMARY KEY (product_configuration_id, product_component_option_id),
  FOREIGN KEY (product_configuration_id) REFERENCES product_configuration(id) ON DELETE CASCADE,
  FOREIGN KEY (product_component_option_id) REFERENCES product_component_option(id) ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TABLE inventory (
  product_component_option_id INT NOT NULL,
  total_stock INT NOT NULL CHECK (total_stock >= 0),
  PRIMARY KEY (product_component_option_id),
  FOREIGN KEY (product_component_option_id) REFERENCES product_component_option(id)
);

CREATE TABLE inventory_reservation (
  session_id INT NOT NULL,
  product_component_option_id INT NOT NULL,
  reserved_units INT NOT NULL CHECK (reserved_units >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (session_id, product_component_option_id),

  -- Can be safely deleted, it is all transient data
  FOREIGN KEY (product_component_option_id) REFERENCES product_component_option(id) ON DELETE CASCADE
  
  -- We are not storing real session data on tables, is all in-memory for demo purposes
  -- FOREIGN KEY (session_id) REFERENCES user_session(id) ON DELETE CASCADE
);

-- To remove expired data and get available inventory
CREATE INDEX expires_at_idx ON inventory_reservation(expires_at);

-- View to get available inventory
CREATE VIEW available_inventory AS
SELECT
  inv_real.product_component_option_id,
  -- Apply a default 10% overbooking
  FLOOR(1.10 * (inv_real.total_stock - COALESCE(SUM(inv_reserved.reserved_units), 0))) as total_stock,
  -- Consider the product_category_id to send less data and save prevent application layer filtering
  pc.id
FROM inventory inv_real
LEFT JOIN inventory_reservation inv_reserved ON (
  inv_real.product_component_option_id = inv_reserved.product_component_option_id
  AND inv_reserved.expires_at > datetime('now')
)
JOIN product_component_option pco ON inv_real.product_component_option_id = pco.id
JOIN product_component pc ON pco.product_component_id = pc.id
JOIN product_category_component pcc ON pc.id = pcc.product_component_id
GROUP BY inv_real.product_component_option_id, inv_real.total_stock, pc.id;

CREATE TABLE customer_order (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- We are not considering in this exercise customer registration
  -- The service layer will use the session id as such. That means that we won't be adding a
  -- FOREIGN KEY. We will index it just to help
  customer_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL,
  -- As in other cases, we use a constraint status to make it more portable
  order_status VARCHAR(256) NOT NULL CHECK (order_status IN ('SESSION_ON_GOING', 'COMPLETED', 'CANCELLED')),
  total_price DECIMAL(10, 4)
);

CREATE INDEX customer_order_customer_id ON customer_order(customer_id);

-- Codify Many to Many
CREATE TABLE customer_order_configuration (
  customer_order_id INT NOT NULL,
  product_configuration_id INT NOT NULL,
  purchased_count INT NOT NULL CHECK (purchased_count >= 0),
  PRIMARY KEY (customer_order_id, product_configuration_id),
  FOREIGN KEY (customer_order_id) REFERENCES customer_order(id),
  FOREIGN KEY (product_configuration_id) REFERENCES product_configuration(id)
) WITHOUT ROWID;

CREATE INDEX customer_order_configuration_product_configuration_id_idx ON customer_order_configuration(product_configuration_id);
