const { Pool } = require('pg');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.connected = false;
  }

  // Initialize database connection and setup
  async initialize() {
    try {
      // Check if database credentials exist
      if (!process.env.PGPASSWORD && !process.env.DATABASE_URL && !process.env.PG_PUBLIC_URL) {
        console.log('⚠️  No database credentials provided - running in IDLE MODE');
        return { connected: false, mode: 'idle' };
      }

      // Create connection pool
      let connectionConfig;

      if (process.env.NODE_ENV === 'development' && process.env.PG_PUBLIC_URL) {
        // Development: Use public URL to connect from outside Railway
        connectionConfig = {
          connectionString: process.env.PG_PUBLIC_URL,
          ssl: { rejectUnauthorized: false }
        };
        console.log('🌐 Using PG_PUBLIC_URL for development connection');
      } else if (process.env.PGHOST && process.env.PGPASSWORD) {
        // Production: Use individual components (internal Railway network)
        connectionConfig = {
          host: process.env.PGHOST,
          port: process.env.PGPORT || 5432,
          database: process.env.PGDATABASE,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
        console.log('🏗️ Using Railway PG components for internal connection');
      } else {
        // Fallback: Check for DATABASE_URL or local defaults
        connectionConfig = {
          connectionString: process.env.DATABASE_URL || undefined,
          host: process.env.PGHOST || 'localhost',
          port: process.env.PGPORT || 5432,
          database: process.env.PGDATABASE || 'lynxbook',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || '',
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
        console.log('🔄 Using fallback connection configuration');
      }

      this.pool = new Pool(connectionConfig);

      // Test connection
      await this.pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL database connected successfully');

      // Setup and validate database schema
      await this.setupDatabase();

      this.connected = true;
      console.log('🚀 Database fully initialized and ready');

      return { connected: true, mode: 'active' };

    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      this.pool = null;
      this.connected = false;
      return { connected: false, mode: 'idle', error: error.message };
    }
  }

  // Complete database setup and validation
  async setupDatabase() {
    console.log('🔄 Setting up database schema...');

    // Run all setup operations in sequence
    await this.enableExtensions();
    await this.createTables();
    await this.addMissingColumns();
    await this.createIndexes();
    // await this.createConstraints();
    await this.createTriggers();
    await this.insertDefaultData();

    console.log('✅ Database schema setup complete');
  }

  // Enable required PostgreSQL extensions
  async enableExtensions() {
    await this.pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  // Create all required tables
  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        address VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Product Category table
      /* `CREATE TABLE IF NOT EXISTS product_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        categery_id INT DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`, */

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_code VARCHAR(100) UNIQUE NOT NULL, -- Product code (e.g., "A1B2")
        name VARCHAR(255) NOT NULL, -- Product name (e.g., "Smartphone")
        image TEXT, -- Product image URL
        description TEXT, -- Product description
        price DECIMAL(10, 2) NOT NULL, -- Price of the product
        stock_quantity INT DEFAULT 0, -- Quantity available in stock
        category VARCHAR(50), -- Product category (electronics, clothes, home_appliances, beauty)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Order table (created first as parent table)
      `CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(100) UNIQUE NOT NULL, -- Unique order identifier
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        payment_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Order detail table (created second, references orders)
      `CREATE TABLE IF NOT EXISTS order_details (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Reference to the order
        order_number VARCHAR(100) NOT NULL, -- Order number shared by all items in the same order (matches orders.order_number)
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- Reference to the product
        base_price DECIMAL(10, 2) NOT NULL, -- Base price of the product at the time of purchase
        quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), -- Quantity of the product
        total_amount DECIMAL(10, 2) NOT NULL, -- Total amount for this line item (base_price * quantity)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Creation timestamp
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Update timestamp
      )`,

      // Product rating table
      `CREATE TABLE IF NOT EXISTS product_ratings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- who rated it
        product_id VARCHAR NOT NULL,
        rating SMALLINT CHECK (rating BETWEEN 1 AND 5) NOT NULL, -- numeric rating
        review TEXT, -- optional text review
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- prevent duplicate ratings by the same user for the same product
        UNIQUE (product_id, user_id)
      )`,

      // Order items table
      /* `CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE, -- Reference to the order
        product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- Reference to the product
        quantity INT NOT NULL, -- Quantity of the product in the order
        price DECIMAL(10, 2) NOT NULL, -- Price of the product at the time of purchase
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )` */

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        order_number VARCHAR(100),
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'order_processing',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await this.pool.query(tableSQL);
    }
  }

  // Add any missing columns to existing tables
  async addMissingColumns() {
    const columns = [
      {
        table: 'users',
        column: 'country',
        type: 'VARCHAR(100)',
        check: `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'country'`
      },
      {
        table: 'users',
        column: 'status',
        type: "VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'))",
        check: `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status'`
      },
      {
        table: 'products',
        column: 'category',
        type: 'VARCHAR(50)',
        check: `SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category'`
      }
    ];

    for (const col of columns) {
      const exists = await this.pool.query(col.check);
      if (exists.rows.length === 0) {
        await this.pool.query(`ALTER TABLE ${col.table} ADD COLUMN ${col.column} ${col.type}`);
        console.log(`✅ Added missing column: ${col.table}.${col.column}`);
        
        // If adding status column, set default value for existing rows
        if (col.column === 'status' && col.table === 'users') {
          await this.pool.query(`UPDATE users SET status = 'active' WHERE status IS NULL`);
          console.log(`✅ Set default status 'active' for existing users`);
        }
      }
    }

    // Migration: Fix order_details to have order_id column and proper relationship
    try {
      // Check if order_details has order_id column
      const orderIdCheck = await this.pool.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = 'order_details' AND column_name = 'order_id'`
      );
      
      // Check if orders has order_number column
      const orderNumberCheck = await this.pool.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number'`
      );

      // Add order_id to order_details if it doesn't exist
      if (orderIdCheck.rows.length === 0) {
        await this.pool.query(`ALTER TABLE order_details ADD COLUMN order_id UUID`);
        console.log(`✅ Added order_id column to order_details`);

        // Migrate: Link order_details to orders via order_number
        await this.pool.query(`
          UPDATE order_details od
          SET order_id = o.id
          FROM orders o
          WHERE o.order_number = od.order_number AND od.order_id IS NULL
        `);
        console.log(`✅ Linked order_details to orders via order_number`);

        // Make order_id NOT NULL after migration
        await this.pool.query(`ALTER TABLE order_details ALTER COLUMN order_id SET NOT NULL`);
        console.log(`✅ Set order_id as NOT NULL in order_details`);

        // Add foreign key constraint
        await this.pool.query(`
          ALTER TABLE order_details 
          ADD CONSTRAINT fk_order_details_order_id 
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        `);
        console.log(`✅ Added foreign key constraint on order_details.order_id`);
      }

      // Ensure orders has order_number column
      if (orderNumberCheck.rows.length === 0) {
        await this.pool.query(`ALTER TABLE orders ADD COLUMN order_number VARCHAR(100)`);
        console.log(`✅ Added order_number column to orders`);

        // Generate order_numbers for existing orders
        await this.pool.query(`
          UPDATE orders
          SET order_number = 'ORD-' || TO_CHAR(created_at, 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(id::text, 1, 8)
          WHERE order_number IS NULL
        `);
        console.log(`✅ Generated order_numbers for existing orders`);

        // Make order_number NOT NULL and unique
        await this.pool.query(`ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL`);
        await this.pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number_unique ON orders(order_number)`);
        console.log(`✅ Set order_number as NOT NULL and unique in orders`);
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  // Create all necessary indexes
  async createIndexes() {
    const indexes = [
      // Order table indexes
      `CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`,
      `CREATE INDEX IF NOT EXISTS idx_order_user_id ON "orders"(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_order_status ON "orders"(status)`,
      `CREATE INDEX IF NOT EXISTS idx_order_created_at ON "orders"(created_at)`,

      // Order detail table indexes
      `CREATE INDEX IF NOT EXISTS idx_order_detail_order_id ON order_details(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_order_detail_order_number ON order_details(order_number)`,
      `CREATE INDEX IF NOT EXISTS idx_order_detail_user_id ON order_details(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_order_detail_product_id ON order_details(product_id)`
    ];

    for (const indexSQL of indexes) {
      await this.pool.query(indexSQL);
    }
  }

  // Create constraints and foreign keys
  async createConstraints() {
    const constraints = [
      // Session table primary key
      {
        name: 'session_pkey',
        sql: 'ALTER TABLE user_sessions ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE'
      }
    ];

    for (const constraint of constraints) {
      try {
        const exists = await this.pool.query(
          `SELECT 1 FROM pg_constraint WHERE conname = $1`,
          [constraint.name]
        );

        if (exists.rows.length === 0) {
          await this.pool.query(constraint.sql);
        }
      } catch (error) {
        // Ignore constraint errors if they already exist
        if (!error.message.includes('already exists')) {
          console.log(`Note: Constraint ${constraint.name} - ${error.message}`);
        }
      }
    }
  }

  // Create triggers for automatic timestamp updates
  async createTriggers() {
    // Create the update function for updated_at column
    await this.pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create the update function for update_date column
    await this.pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create the update function for update column (order_detail)
    await this.pool.query(`
      CREATE OR REPLACE FUNCTION update_update_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql'
    `);

    const triggers = [
      { table: 'users', column: 'updated_at', function: 'update_updated_at_column' },
      { table: '"orders"', column: 'updated_at', function: 'update_updated_at_column' },
      { table: 'order_details', column: '"update"', function: 'update_update_column' }
    ];

    for (const trigger of triggers) {
      const cleanTableName = trigger.table.replace(/"/g, '');
      const cleanColumnName = trigger.column.replace(/"/g, '');
      const triggerName = `update_${cleanTableName}_${cleanColumnName}`;
      try {
        const exists = await this.pool.query(
          `SELECT 1 FROM pg_trigger WHERE tgname = $1`,
          [triggerName]
        );

        if (exists.rows.length === 0) {
          await this.pool.query(`
            CREATE TRIGGER ${triggerName} 
            BEFORE UPDATE ON ${trigger.table} 
            FOR EACH ROW EXECUTE PROCEDURE ${trigger.function}()
          `);
        }
      } catch (error) {
        console.log(`Note: Trigger ${triggerName} - ${error.message}`);
      }
    }
  }

  // Insert default/initial data
  async insertDefaultData() {
    const bcrypt = require('bcryptjs');

    // Insert test user if it doesn't exist
    const testUserExists = await this.pool.query(
      `SELECT 1 FROM users WHERE email = $1`,
      ['vue.app@yopmail.com']
    );

    if (testUserExists.rows.length === 0) {
      const password_hash = await bcrypt.hash('password', 12);
      await this.pool.query(`
        INSERT INTO users (name, email, password_hash, phone, postal_code, address, country,
          email_verified, status, created_at, updated_at
        ) 
        VALUES ('Martin Joe', 'vue.app@yopmail.com', $1, '+1 987609 9876', '369 598', 'Ahmedabad', 'India', 
        true, 'active', NOW(), NOW()
        )
      `, [password_hash]);
      console.log('✅ Added test user: vue.app@yopmail.com / password');
    }
  }

  // Get connection pool (for use in other parts of the app)
  getPool() {
    return this.pool;
  }

  // Check if database is connected
  isConnected() {
    return this.connected;
  }

  // Execute a database query
  async query(text, params) {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }
    return this.pool.query(text, params);
  }

  // Get database status for monitoring
  async getStatus() {
    if (!this.connected) {
      return {
        connected: false,
        mode: 'idle',
        message: 'Database not connected'
      };
    }

    try {
      const result = await this.pool.query('SELECT NOW() as current_time');
      const tableCount = await this.pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      return {
        connected: true,
        mode: 'active',
        current_time: result.rows[0].current_time,
        tables: parseInt(tableCount.rows[0].count),
        message: 'Database fully operational'
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'error',
        error: error.message
      };
    }
  }

  // Filip's Cookbook Helper Functions
  async checkColumnExists(tableName, columnName) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const result = await this.pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [tableName, columnName]);

    return result.rows.length > 0;
  }

  async checkIndexExists(indexName) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const result = await this.pool.query(`
      SELECT indexname FROM pg_indexes WHERE indexname = $1
    `, [indexName]);

    return result.rows.length > 0;
  }

  async checkTableExists(tableName) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const result = await this.pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = $1
    `, [tableName]);

    return result.rows.length > 0;
  }

  // Safe migration helpers
  async addColumnIfNotExists(tableName, columnName, columnDefinition) {
    if (!await this.checkColumnExists(tableName, columnName)) {
      await this.pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      console.log(`✅ Added column ${columnName} to ${tableName}`);
    }
  }

  async createIndexIfNotExists(indexName, tableName, columns) {
    if (!await this.checkIndexExists(indexName)) {
      await this.pool.query(`CREATE INDEX ${indexName} ON ${tableName}(${columns})`);
      console.log(`✅ Created index ${indexName} on ${tableName}(${columns})`);
    }
  }
}

module.exports = new DatabaseManager(); 