import { db, migrationRunner, type Migration } from "@/lib/database"
import { logger } from "@/lib/logger"

// Define database migrations
const migrations: Migration[] = [
  {
    name: "001_create_users_table",
    up: async (db) => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'viewer',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_login TIMESTAMP
        )
      `)

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `)
    },
    down: async (db) => {
      await db.query("DROP TABLE IF EXISTS users")
    },
  },

  {
    name: "002_create_requests_table",
    up: async (db) => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_name VARCHAR(255) NOT NULL,
          client_phone VARCHAR(50) NOT NULL,
          client_email VARCHAR(255),
          service_type VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          location_address TEXT NOT NULL,
          location_zone VARCHAR(100) NOT NULL,
          location_coordinates JSONB,
          location_access_instructions TEXT,
          priority VARCHAR(20) DEFAULT 'normal',
          status VARCHAR(50) DEFAULT 'pending',
          scheduled_date TIMESTAMP,
          estimated_budget DECIMAL(10,2),
          estimated_cost_min DECIMAL(10,2),
          estimated_cost_max DECIMAL(10,2),
          actual_cost DECIMAL(10,2),
          assigned_provider_id UUID,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)
      `)
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_requests_service_type ON requests(service_type)
      `)
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at)
      `)
    },
    down: async (db) => {
      await db.query("DROP TABLE IF EXISTS requests")
    },
  },

  {
    name: "003_create_providers_table",
    up: async (db) => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS providers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          whatsapp VARCHAR(50),
          email VARCHAR(255),
          services TEXT[] NOT NULL,
          coverage_areas TEXT[] NOT NULL,
          hourly_rate DECIMAL(8,2) NOT NULL,
          experience INTEGER DEFAULT 0,
          description TEXT,
          rating DECIMAL(3,2) DEFAULT 0,
          review_count INTEGER DEFAULT 0,
          total_missions INTEGER DEFAULT 0,
          success_rate DECIMAL(5,2) DEFAULT 0,
          response_time INTEGER DEFAULT 0,
          acceptance_rate DECIMAL(5,2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active',
          availability VARCHAR(20) DEFAULT 'available',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_active TIMESTAMP DEFAULT NOW()
        )
      `)

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status)
      `)
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_providers_services ON providers USING GIN(services)
      `)
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_providers_coverage_areas ON providers USING GIN(coverage_areas)
      `)
    },
    down: async (db) => {
      await db.query("DROP TABLE IF EXISTS providers")
    },
  },

  {
    name: "004_create_request_images_table",
    up: async (db) => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS request_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_request_images_request_id ON request_images(request_id)
      `)
    },
    down: async (db) => {
      await db.query("DROP TABLE IF EXISTS request_images")
    },
  },

  {
    name: "005_create_settings_table",
    up: async (db) => {
      await db.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category VARCHAR(100) NOT NULL,
          key VARCHAR(100) NOT NULL,
          value JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(category, key)
        )
      `)

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category)
      `)
    },
    down: async (db) => {
      await db.query("DROP TABLE IF EXISTS settings")
    },
  },
]

async function setupDatabase() {
  try {
    logger.info("Starting database setup...")

    // Connect to database
    await db.connect()

    // Add migrations
    migrations.forEach((migration) => {
      migrationRunner.addMigration(migration)
    })

    // Run migrations
    await migrationRunner.runMigrations()

    // Create default admin user if not exists
    const existingUsers = await db.query("SELECT COUNT(*) as count FROM users")
    if (existingUsers[0].count === 0) {
      logger.info("Creating default admin user...")

      const { AuthService } = await import("@/lib/auth")
      const hashedPassword = await AuthService.hashPassword("admin123")

      await db.query(
        `
        INSERT INTO users (email, name, password_hash, role)
        VALUES ('admin@djobea.com', 'Admin User', ?, 'admin')
      `,
        [hashedPassword],
      )

      logger.info("Default admin user created: admin@djobea.com / admin123")
    }

    logger.info("Database setup completed successfully")
  } catch (error) {
    logger.error("Database setup failed", error as Error)
    process.exit(1)
  } finally {
    await db.disconnect()
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
}

export { setupDatabase }
