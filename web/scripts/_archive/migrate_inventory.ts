import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!dbUrl) {
  console.error('❌ Missing DATABASE_URL or SUPABASE_DB_URL in .env.local')
  process.exit(1)
}

async function runMigration() {
  const client = new Client({ connectionString: dbUrl })

  try {
    await client.connect()
    console.log('✅ Connected to Database')

    // 1. Run Schema
    console.log('📄 Running db/30_inventory.sql...')
    const schemaPath = path.resolve(__dirname, '../db/30_inventory.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    await client.query(schemaSql)
    console.log('   Done.')

    // 2. Discover clinics
    const contentDir = path.resolve(__dirname, '../.content_data')
    const clinics = fs
      .readdirSync(contentDir)
      .filter((f) => fs.statSync(path.join(contentDir, f)).isDirectory() && f !== '_TEMPLATE')

    console.log(`🔍 Found clinics: ${clinics.join(', ')}`)

    for (const clinicId of clinics) {
      const productsPath = path.join(contentDir, clinicId, 'store/products.json')
      if (!fs.existsSync(productsPath)) {
        console.log(`⚠️ No products.json found for ${clinicId}, skipping.`)
        continue
      }

      console.log(`📦 Migrating products for ${clinicId}...`)
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

      // Collect unique categories
      const categories = Array.from(new Set(products.map((p: any) => p.category))) as string[]

      // Insert Categories
      const categoryMap = new Map<string, string>()
      for (const catName of categories) {
        const slug = catName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
        const res = await client.query(
          'INSERT INTO store_categories (tenant_id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (tenant_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
          [clinicId, catName, slug]
        )
        categoryMap.set(catName, res.rows[0].id)
      }

      // Insert Products
      for (const p of products) {
        const catId = categoryMap.get(p.category)

        // Use original ID as SKU
        const productRes = await client.query(
          `
                    INSERT INTO store_products (tenant_id, category_id, sku, name, description, image_url, base_price)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (tenant_id, sku) DO UPDATE SET
                        category_id = EXCLUDED.category_id,
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        image_url = EXCLUDED.image_url,
                        base_price = EXCLUDED.base_price
                    RETURNING id
                `,
          [clinicId, catId, p.id, p.name, p.description, p.image, p.price]
        )

        const productId = productRes.rows[0].id

        // Initialize inventory with 0 stock if it doesn't exist
        await client.query(
          `
                    INSERT INTO store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
                    VALUES ($1, $2, 0, 0)
                    ON CONFLICT (product_id) DO NOTHING
                `,
          [productId, clinicId]
        )
      }
      console.log(`   Done migrating ${products.length} products for ${clinicId}.`)
    }

    console.log('🎉 Migration Successful!')
  } catch (err) {
    console.error('❌ Error during migration:', err)
  } finally {
    await client.end()
  }
}

runMigration()
