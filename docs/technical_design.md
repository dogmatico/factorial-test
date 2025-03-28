# Technical design: Factorial challenge

This document outlines the technical approach for the selection process at
[Factorial](https://factorial.es/). We will analyze and propose solutions for
[suggested problem](./problem_statement.md), evaluating trade-offs and design decisions.

To maintain a reasonable document length, we will organize the content using a repository structure
based on features. Each feature folder will contain detailed documentation, and direct links will be
provided for easy navigation.

The approach includes:

- Code snippets in TypeScript.

- Feature descriptions in Gherkin.

- Entity definitions as SQL tables.

- Mermaid diagrams for visual representation when necessary.

_Disclaimer_: Large Language Models (LLMs) have been used to refine the wording and grammar of
this document. However, all ideas, approaches, and technical decisions are my own, derived from
personal experience and relevant bibliography.

## Problem Statement and Scope

The proposed problem is extensive, and a complete solution cannot be modeled in detail within the
reasonable time frame of an interview. I will address all questions outlined in the problem statement,
while explicitly defining boundaries for areas that will remain untreated or deferred as future
improvements:

1. **User Management**:  
   User management, including permissions, will not be considered. For the scope of this exercise,
   we will assume a role-based model. If needed in a follow-up phase, user federation could be
   implemented using OAuth + OpenID. In the sample application, a session will be auto-generated for
   an ephemeral user to allow testing inventory management and the checkout cart without implementing
   a full authentication system.

2. **Multi-Tenancy and Multi-Location**:  
   Multi-tenancy and multi-location support will not be included. The system will assume a single
   physical shop, which also serves as the primary and only warehouse. Inventory locks will be
   managed within a single logical warehouse.

3. **Delivery and Post-Order Flows**:  
   Delivery and all post-order processes (except order cancellation) are out of scope. This includes
   address management, shipping, and delivery costs.

4. **Target Audience**:  
   The application targets small businesses and is designed as a single-tenant system. This decision
   impacts the design significantly (e.g., a single relational database with standard backup
   mechanisms, or a single service). However, these infrastructure details will not be explored further
   in this document to avoid premature implementation discussions.

5. **Telemetry, and monitoring**:
   We won't be observing user events that would otherwise be necessary to iterate in a real product.

6. **Localization**:
   We won't consider multi-currency, multi-language, or taxation.

## Technical Details

Given the constraints outlined in the problem statement, we will use a **Single Page Application (SPA)**
architecture, connected to a back-end via an HTTP-based API. The approach will be **top-down**,
starting with the definition of access patterns, deriving an API contract from them, and then
designing an architecture that supports these requirements.

### Access Patterns

We consider two types of data access patterns: **shopper** and **shop employee**.

#### Shopper Access Patterns

As a shopper, I want to:

- Navigate to a storefront where I can see a selection of suggested products.
- Select a product and customize it.
  - While customizing:
    - See how different components impact the price in a logical manner.
    - Be notified if certain options are out of stock.
    - Receive alternative suggestions if my desired options are incompatible with my current choices.
  - Add my selected configuration to the checkout cart.
- Edit or remove items from the cart before committing to an order.
- Receive confirmation or notifications about the status of my order after committing (e.g.,
  processed, issues encountered).

#### Employee Access Patterns

As an employee, I want to:

- Create product breakdowns by components.
- Define component options (flavours) and their pricing.
- Set price modifiers for specific component combinations.
- Define forbidden component combinations.
- Manage inventory levels for individual components.
- View all existing orders, including cancelled orders and uncommitted orders in live sessions.
- Cancel orders when necessary.

#### Order Management and Inventory Considerations

One of the main challenges in this problem is managing inventory during the shopping flow.
The primary approaches are:

1. **No Lock**:

   - Do not reserve components when adding a product to the cart.
   - At checkout, verify inventory availability within a transaction.
   - **Pros**: Simple to implement.
   - **Cons**: Least satisfactory for customers, as it can lead to order failures after they have
     invested time customizing their product.

2. **Lock on Components**:

   - Reserve components when adding a product to the cart.
   - Components remain locked until the order is committed or the session expires.
   - **Pros**: Customer-friendly, as it ensures availability during customization.
   - **Cons**: Can lead to poor shopping experiences in high-concurrency scenarios, as locks may
     prevent other customers from accessing components. Requires a quota mechanism to prevent
     malicious locks.

3. **Lock with Overbooking**:
   - Reserve components with an overbooking parameter, allowing a limited number of concurrent orders
     beyond available inventory.
   - Commonly used in the hospitality industry to balance lost sales and customer satisfaction.
   - **Pros**: Reduces lost sales in high-concurrency scenarios while maintaining a controlled no-lock
     experience.
   - **Cons**: Adds complexity to inventory management. Requires a quota mechanism to prevent abuse
     and ensure system stability.

We will implement the **lock with overbooking** mechanism, as it provides a more general solution
than a simple lock and strikes a good balance between user satisfaction and inventory management. The
inclusion of a quota mechanism will ensure that the system remains fair and scalable under high demand.

### Front-end

This section will discuss the stack from the proper UI down to an API shape that can support it.

#### UI Architecture and Flow

The front-end will be a **Single Page Application (SPA)** built with **React**. This choice aligns
with the problem constraints and is not subject to discussion. While React was selected primarily
due to the author's technical expertise and recent experience, it also influences the selection of
additional tools in the front-end architecture.

##### Key Technologies

1. **Routing**:

   - **TanStack Router** will be used for routing. It is fully typed and integrates seamlessly with
     Vite, providing an excellent developer experience.
   - A well-typed router is essential, as the URL will serve as a source of truth for certain flows
     (e.g., search), and pages will react to changes in the URL.

2. **State Management**:

   - **Redux** will be used as a global state store and business event bus.
   - Modeling with events simplifies side-effect management and enables future extensibility
     (e.g., telemetry events).
   - Local state will be preferred over global state whenever possible to maintain simplicity.

3. **Forms**:
   - **React Hook Form** will be used to handle complex form logic, such as incompatible component
     selections and dynamic validation rules.

##### Pages: Shopper Experience

The shopper experience will be built around a simple design with two main areas:

1. **Header**:

   - Contains tab-based navigation with the following options:
     - **Home**: Landing page with company description, logo, and highlighted products.
     - **Category Links**: One link per category (e.g., Bikes).
     - **Shopping Cart**: Access to the checkout flow.

2. **Content Area**:
   - Displays the main content based on the selected page.

###### Page routes: Shopper

1. **Home (`/`)**:

   - Displays the company description, logo, and a selection of highlighted products.

2. **Category Storefront (`/shop/:category`)**:

   - Inspired by shops like Apple or Dell, this page allows shoppers to select a base configuration
     before proceeding to a detailed customization page.

3. **Product Customization (`/shop/:category/new/:baseProductName`)**:

   - Allows shoppers to customize their selected product and see a real-time price preview.

4. **Edit Product (`/shop/:category/edit/:selectedProductId`)**:

   - Enables shoppers to edit a previously configured product before adding it to the cart.

5. **Checkout (`/checkout`)**:

   - Provides a review and confirmation screen where shoppers can commit their order or make final
     edits to the cart.

6. **Reset session (`/new-session`)**:
   - Will call the clear session method and request a full reload. To manage the reduced scenario
     we are considering.

##### Pages: Admin Experience

The admin experience will be built around a simple design with three main areas:

1. **Header**:

   - Logo and logout icon.

2. **Side Menu**:

   - Navigation menu with the following options:
     - **Home**: Dashboard page.
     - **Products**: Section to create bundles and define components.
     - **Inventory**: Warehouse management.
     - **Orders**: Order management.
     - **Logout**: Log out of the admin panel.

3. **Content**:
   - Displays the main content of the page. Views that support tab navigation will offer it at the
     top level.

###### Page Routes: Admin

1. **Home (`/admin`)**:

   - Dashboard with an overview of key metrics.

2. **Inventory Main (`/admin/inventory`)**:

   - Table displaying inventory items. Supports query string search parameters and CRUD operations.

3. **Inventory/Component (`/admin/inventory/component/:componentId`)**:

   - Detailed view of a component, including links to its usages. Allows management of pricing (base
     price, supplements, and incompatibilities).

4. **Products Main (`/admin/products`)**:

   - Table displaying products. Supports query string search parameters.

5. **Products/Breakdown (`/admin/products/:productId`)**:

   - CRUD operations for products, including component breakdown.

6. **Products/Breakdown/Configuration (`/admin/products/:productId/configurations`)**:

   - Table displaying product configurations. Supports query string search parameters. Displays price
     and stock availability.

7. **Products/Breakdown (`/admin/products/:productId/configurations/:configurationId`)**:

   - CRUD operations for a base configuration.

8. **Orders Main (`/admin/orders`)**:

   - Table displaying orders. Supports query string search parameters.

9. **Orders/Order Status (`/admin/orders/:orderId`)**:
   - Detailed view of an order. Allows order cancellation.

##### Managing Session

On application startup, the app will request session information to initialize the user's shopping
experience.

###### API Call to Fetch Session

```text
POST /api/v1/shop/currentSession
```

**Response payload**,

```ts
interface CurrentSession {
  id: string; // Unique session ID
  expiresAt: number; // Timestamp indicating session expiration
  hasPendingOrders: boolean; // Indicates if the session has pending orders
}
```

The API Call has the following side effects:

1. Session Cookie:

   - The API sets an httpOnly cookie to manage the session securely.

2. CSRF Protection:

   - A non-httpOnly header named X-CSRF-TOKEN is returned. This token must be included in subsequent
     API requests as a header to prevent CSRF attacks.

**Closing the Session**,

The session can be terminated by visiting the Reset Session page. This page triggers the following API call:

```text
DELETE /api/v1/shop/currentSession
```

After calling this endpoint, the application will request a full page reload to reset the session state.

##### Managing Product Customization

For each category, the following data is requested from the server to compile the customization
experience:

1. **Product Breakdown**:

   - The ordered list of components required to build a product. The order is meaningful for the
     customization flow.

2. **Inventory**:

   - The available inventory for each component, capped by a configurable quota per session.

3. **Pricing**:

   - The minimum price for each component option.
   - Supplements or discounts based on specific combinations.

4. **Incompatibility Rules**:
   - Rules that define which component options cannot be combined.

This data is fetched from the server to ensure a smooth user experience. Below are the key entities
and the API call that powers this view:

###### Entities

```typescript
interface Category {
  id: string;
  name: string;
  description: string;

  // Ordered list of component IDs
  productBreakDown: string[];
}

interface Component {
  id: string;
  name: string;
  description: string;

  // IDs of available options for this component
  availableOptions: string[];
}

interface ComponentOption {
  id: string;
  name: string;
  description: string;

  // Base price of the option (using numbers for simplicity, but should handle decimals)
  basePrice: number;

  // Number of units available for the session (capped by quota)
  availableUnits: number;
}

interface ComponentOptionsRule {
  id: string;
  kind: "SUPPLEMENT" | "FORBIDDEN"; // Defines the type of rule

  // Rule applies to a pair of options
  option1Id: string;
  option2Id: string;

  // Value of the supplement or forbidden rule
  value: number;
}
```

###### The API call

```text
GET /api/v1/shop/category/:categoryId
```

The response payload,

```ts
interface ShopCategoryResponsePayload {
  isSuccess: boolean;
  error: APIError | null;
  data: {
    category: Category;
    components: Component[];
    componentOptions: ComponentOption[];
    componentOptionsRules: ComponentOptionsRule[];
  };
}
```

The fetched data is stored in the global store in a fully normalized format to ensure efficient
access and updates.

##### Managing Checkout Cart

The checkout cart state is defined as follows:

###### State Definition

```typescript
interface CheckoutCartState {
  configurations: Record<string, OrderConfiguration>; // Maps configuration IDs to their details
  configurationIds: string[]; // Ordered list of configuration IDs
}

interface OrderConfiguration {
  id: string; // Autogenerated ID, serves as an idempotency key
  categoryId: string; // ID of the product category
  componentIds: ComponentOption[]; // List of selected component options

  lastPrice: number; // Pre-computed price for fast access
  isValid: boolean; // Indicates if the configuration is valid based on the latest inventory data
}
```

This state powers two key features:

1. Header Widget:

   - Displays a summary of the cart (e.g., number of items, total price).

2. Review and Confirm Screen:
   - Allows users to review their selected configurations, validate their choices, and proceed to
     checkout.

###### Upserting configuration

To upsert a configuration into the checkout cart, the front-end will generate an idempotency key that
must be unique per configuration. While a UUID is recommended, it will be namespaced with the session
information on the server to prevent collisions or malicious calls. The payload for this operation is:

```ts
type UpsertOrderConfigurationPayload = Omit<
  OrderConfiguration,
  "lastPrice" | "isValid"
>;
```

The API endpoint for this operation is:

```text
PUT /api/v1/shop/chart/configuration
```

###### Removing a configuration

To remove a configuration from an ongoing order, the following API endpoint is used:

```text
DELETE /api/v1/shop/chart/configuration/:configurationId
```

#### Testing Approach

- **Acceptance-Level Tests**:  
  These should be prioritized to ensure the application meets business requirements. The back-end
  should provide testing tooling that can be used with **MSW.js** to simulate interactions with
  services.

- **Unit Tests**:  
  Additional unit tests may be required for specific logic, such as price computation and
  compatibility checks, to ensure accuracy and reliability.

- **Testing Library**:  
  We will use **Testing Library** for assertions based on real rendering, avoiding shallow rendering
  (e.g., Enzyme-like approaches). This ensures that tests closely mimic real user interactions and
  component behavior.

### Back-end

Given the problem constraints and the target audience (single tenant small businesses), the back-end
will be implemented as a **monolith**. This decision aligns with the need for simplicity and maintainability,
while still meeting the application's requirements.

#### API Design

- The back-end will expose a **REST-like API**.
- The API contract will be enforced using **static analysis** with TypeScript, leveraging the
  mono-repo structure of this exercise.
- In a real-world scenario, the public API could be typed using **GraphQL** or **tRPC**, but these
  are out of scope to keep the exercise manageable within a reasonable time frame.
- We will use a single `Result` generic interface.

#### Why Not Microservices?

An alternative approach based on **event-driven microservices** and distributed transactions was
considered but ultimately deemed unsuitable for this scenario due to the following reasons:

1. **Observability and Distributed Transactions**:

   - Proper observability and handling of distributed transactions are central to a microservices
     architecture but were not considered in the problem statement.

2. **Specialized Staff**:

   - Maintaining a distributed system requires a more specialized team, which may not be feasible
     for a small business.

3. **Scalability Requirements**:
   - Based on the problem statement, it is not foreseeable that the application's traffic will exceed
     the capacity of commercially available servers, making a monolithic architecture sufficient.

#### What If We Need to Scale?

By ensuring proper code modularity, we can enable horizontal growth if required, without immediately resorting to a complete architectural overhaul. This approach provides flexibility in case our initial predictions do not match real-world demands.

##### Strategies for Scalability

1. **Code Modularity**:

   - Use well-defined interfaces, single-responsibility classes, and dependency injection.
   - This modularity will allow us to break down large domains (e.g., session management, inventory
     management) into smaller, more manageable components.
   - It also enables stateless services by encapsulating the choice between in-memory storage (for
     ephemeral data) and external services.

2. **Load Balancing**:

   - Implement a **load balancer** at the ingress level to distribute traffic across multiple
     instances of the application, enabling horizontal scaling.

3. **Caching**:
   - Cache responses for frequently accessed data, such as product highlights and pre-made
     configurations, to reduce server load and improve response times.

#### Access patterns

From the front-end analysis and problem statement, we can list the expected access patterns.  
These access patterns define the data model and indexing strategy:

- **Category**:

  - CRUD by ID
  - Set product breakdown
  - Link base configurations
  - Link customer configuration

- **Component**:

  - CRUD by ID
  - Link component options

- **Component Option**:

  - CRUD by ID
  - Set base pricing
  - Set price supplements
  - Set compatibility rules

- **Configuration**:

  - CRUD by ID
  - Link used component options

- **Component Inventory**:

  - CRUD by ID
  - Find by product consumption and stock count
  - Reserve units for on-shop lock

- **Orders**:
  - CRUD by ID
  - Find by status and creation date
  - Link configurations

#### Data Model

Given the access patterns outlined above, a **relational database model** is the most suitable choice.
This decision is based on the following considerations:

1. **Cardinality of Data**:

   - The target audience (small and medium-sized businesses) is not expected to generate data with
     high cardinality that would prevent proper indexing or require data partitioning.
   - This low cardinality also justifies excluding pre-computed views, which are better suited for
     document databases or eventually consistent views from streams.

2. **Transactional Integrity**:

   - The system manages inventory and order processing, which require strong transactional guarantees.
     A single relational database provides **ACID compliance**, ensuring data consistency and integrity.

3. **Data Relationships and Joins**:

   - The data model includes strong relationships (one-to-one, one-to-many, many-to-many) that benefit
     from **JOIN operations** and normalized data.
   - The expected data cardinality and concurrent connections do not justify the complexity of
     distributed data storage.

4. **Indexing**:

   - The default indexing capabilities of relational database engines are sufficient to support the
     defined access patterns.
   - There is no need for specialized indexes (e.g., spatial data, free-text search) that would
     require additional plugins or a specialized database.

5. **Scalability**:
   - A single relational database (or a small number of instances within a shard) is sufficient to
     handle the expected load from single-tenant, small, and medium-sized businesses.
   - This approach maintains **low latency** and **strong consistency** without introducing unnecessary
     complexity.

##### Entities and indexing

We now define the relationa model using SQL table definitions. In the implementation, we will have
a one to one mapping of Entity classes to tables, representing a row, and manager classes for operation
involving multiple entities. This matches the common Entity/Manager or Repository pattern.

###### Base business entities

In this section we define the base business entities

```sql
CREATE TABLE product_category (
  id INT PRIMARY KEY AUTOINCREMENT,
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
```

```sql
CREATE TABLE product_component (
  id INT PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(256) UNIQUE NOT NULL,
  description TEXT,

  -- Logic to soft delete. Hard delete can cause data loss and inconsistencies with orders and
  -- inventories
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
```

```sql
-- Many to many relation categories and components

CREATE TABLE product_category_component (
  product_category_id INT NOT NULL,
  product_component_id INT NOT NULL,
  quantity INT CHECK (quantity >= 1),
  PRIMARY KEY (product_category_id, product_component_id),

  -- We can remove part of this if data cardinality was higher to remove constraints on the database
  FOREIGN KEY (product_category_id) REFERENCES product_category(id) ON DELETE CASCADE,
  FOREIGN KEY (product_component_id) REFERENCES product_component(id) ON DELETE CASCADE
) WITHOUT ROWID;

CREATE INDEX product_category_component_product_component_id_idx ON product_category_component(product_component_id);
```

```sql
CREATE TABLE product_component_option (
  id INT PRIMARY KEY AUTOINCREMENT,
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
```

```sql
CREATE TABLE product_component_option_rule (
  id INT PRIMARY KEY AUTOINCREMENT,
  product_component_option_id_1 INT NOT NULL,
  product_component_option_id_2 INT NOT NULL,
  -- We could use an enum, but that can produce another table if not supported natively by the SQL engine
  kind VARCHAR(256) NOT NULL CHECK (kind IN ('SUPLEMENT', 'FORBIDDEN')),
  -- Consumer will cast it depending on the kind
  rule_value TEXT,

  FOREIGN KEY (product_component_option_id_1) REFERENCES product_component_option(id) ON DELETE CASCADE,
  FOREIGN KEY (product_component_option_id_2) REFERENCES product_component_option(id) ON DELETE CASCADE,
  -- This with the unique index will ensure no duplicate rules of the same kind, plus rules on itself
  CONSTRAINT check_ordering CHECK (product_component_option_id_1 < product_component_option_id_2)
);

CREATE UNIQUE INDEX product_component_option_rule_parents_idx
  ON product_component_option_rule(product_component_option_id_1, product_component_option_id_2, kind);
```

```sql
CREATE TABLE product_configuration (
  id INT PRIMARY KEY AUTOINCREMENT,
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
```

###### Inventory management and soft lock on timeout plus overbooking

One of the main challenges is implementing the lock logic. We will use two "warehouses":

1. Actual Warehouse:

   - Tracks non-committed reservations.

2. Reservation Warehouse:
   - Tracks units locked until an order is committed.

To keep the data model simple, overbooking will be a global parameter. While it is possible to set
the overbooking parameter per component option (which might be desirable for high-priced items or
launch events), this is out of scope for now.

```sql
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
```

The available stock is derived from a view. Depending on benchmarks, this could be materialized or
virtual. For now, we use a virtual view with a default 10% overbooking:

```sql
CREATE VIEW available_inventory AS
  SELECT
    inv_real.product_component_option_id,
    -- Apply a default 10% overbooking
    FLOOR(1.10 * (inv_real.total_stock - COALESCE(SUM(inv_reserved.reserved_units), 0))) as total_stock,
    -- Consider the product_category_id to send less data and save prevent application layer filtering
    pc.product_category_id
  FROM inventory inv_real
  LEFT JOIN inventory_reservation inv_reserved ON (
    inv_real.product_component_option_id = inv_reserved.product_component_option_id
    AND inv_reserved.expires_at > datetime('now')
  )
  JOIN product_component_option pco ON inv_real.product_component_option_id = pco.id
  JOIN product_component pc ON pco.product_component_id = pc.id
  JOIN product_category_component pcc ON pc.id = pcc.product_component_id
  GROUP BY inv_real.product_component_option_id, inv_real.total_stock, pc.product_category_id;
```

In addition to the built-in release of the reserved units on session expiration, we need a cron task
on the service layer, running every minute, to clean-up reserved units using the
`inventory_reservation.expires_at column`. This task should include error handling and logging to
ensure data integrity and system stability.

###### Order management

Orders are defined as

```sql
CREATE TABLE customer_order (
  id INT PRIMARY KEY AUTOINCREMENT,
  -- We are not considering in this exercise customer registration
  -- The service layer will use the session id as such. That means that we won't be adding a
  -- FOREIGN KEY. We will index it just to help
  customer_id INT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,

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
```

to keep the model simplified, we will not be storing the price breakdown, although it will be
necessary to do it in real cases to manage exchanges of individual products or components.

#### API design

All API responses will return a unified Result interface,

```ts
interface APIResponse<T> {
  isSuccess: boolean;
  data: T | null;
  errors: APIError[];
  warnings: APIError[];
}
```

The `APIError` interface ensures smooth error management and debugging:

```ts
interface APIError {
  /**
   * Code for programmatic handling
   */
  code: string;

  /**
   * Human readable description
   */
  description: string;

  /**
   * UUID for helpdesk/debug
   */
  id?: string;
}
```

##### Payload Format

- All request and response payloads use the `application/json` MIME type.

- This approach simplifies the design and aligns with the current scope.

- If images or other assets were added to the entities, some admin endpoints would switch to
  `multipart/form-data`. However, this is out of scope, as it introduces additional complexity
  (e.g., local vs. object storage, hot-linking prevention, API gateway configuration).

##### Status codes

All API responses will use standard HTTP status codes to indicate the outcome of the request. Error
status codes- outside pre-condition, and input validations- will be set to 207 on transactional
non-sigle item CRUD items to point to consumers that the response should be checked for errors.

##### Versioning

We consider only API version by path. Version on entities, and content negotiation is out of scope.

##### Security

We are not adding user authentication at this point. However, the API will use a cookie-to-header
approach to prevent CSRF attacks, as outlayed in the section `API Call to Fetch Session`.

#### API testing approach

Acceptance level tests at the API endpoint will be the main testing focus. The exact tooling depends on
the framework, but as a reference, we can point to [supertest](https://www.npmjs.com/package/supertest).

The server package will export interfaces and mock response factories. Consumers could leverage those
to get confident tests without requiring end-to-end testing.

In a real-world product, load and contract testing, API specification artifacts, and CI/CD integration
should be considered. We are keeping them out of scope for this exercise.

#### Code structure and modularity

This is highly dependent on the framework and language of choice. For the demo, as a proposal based
on Express.js that supports modularity, the service will be structured as:

- **Feature folders**: These will:

  - Contain all feature-related code.
  - Include a `README.md` explaining the feature itself.
  - Include all feature files.
  - Use a base setup function that takes the app instance as an argument, augmenting the base
    functionality.

- **A single business event bus**:
  - Using Node.js `EventEmitters`, modules will be able to publish and subscribe to business events.
    A wrapper function will manage some of the complexity, allowing listening à la Redux.

## Future improvements, and open questions

### Inventory

To keep the exercise simple, we considered only a traditional inventory system. An improvement, at
the cost of extra complexity in inventory management, would be to use a ledger to double-account
movements of goods and components between stages (warehouse, reserved, factory, delivery, etc.).
This could be used to reconstruct the full history of any component, for audit purposes, and for
catastrophic failure recovery.

### Categorization/tags

The design assumes that a product category can have only a single product breakdown. This is open
to discussion, as we can consider electrical and traditional bikes as the same category, but clearly
they have different components (at a minimum, a motor and a battery). If we want to consider these
kinds of cases, it is probably more flexible to add a system of tags to entities instead of adding
one more level of depth in the entity graph. This is an easy add-on to implement as an extension of
the proposed data model without modifying the entities, making it a clear first plugin if this were
a true shop module.
