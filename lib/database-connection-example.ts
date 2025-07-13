// Exemple de connexion et utilisation de PostgreSQL

import { Pool } from "pg"

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === "production",
  max: 20, // Maximum de connexions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Exemple d'utilisation dans une API route
export class ProvidersService {
  // Récupérer tous les prestataires
  static async getAllProviders(filters: any) {
    const client = await pool.connect()
    try {
      const query = `
        SELECT 
          p.*,
          AVG(r.rating) as avg_rating,
          COUNT(j.id) as completed_jobs
        FROM providers p
        LEFT JOIN reviews r ON p.id = r.provider_id
        LEFT JOIN jobs j ON p.id = j.provider_id AND j.status = 'completed'
        WHERE p.status = $1
        GROUP BY p.id
        ORDER BY avg_rating DESC, completed_jobs DESC
        LIMIT $2 OFFSET $3
      `

      const result = await client.query(query, [
        filters.status || "active",
        filters.limit || 10,
        (filters.page - 1) * filters.limit || 0,
      ])

      return result.rows
    } finally {
      client.release()
    }
  }

  // Créer un nouveau prestataire
  static async createProvider(providerData: any) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Insérer le prestataire
      const providerQuery = `
        INSERT INTO providers (name, email, phone, specialty, zone, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `

      const providerResult = await client.query(providerQuery, [
        providerData.name,
        providerData.email,
        providerData.phone,
        providerData.specialty,
        providerData.zone,
        "pending",
      ])

      // Insérer les compétences
      if (providerData.skills?.length > 0) {
        const skillsQuery = `
          INSERT INTO provider_skills (provider_id, skill_name)
          VALUES ${providerData.skills.map((_, i) => `($1, $${i + 2})`).join(", ")}
        `

        await client.query(skillsQuery, [providerResult.rows[0].id, ...providerData.skills])
      }

      await client.query("COMMIT")
      return providerResult.rows[0]
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }
}
