const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const assignments = [
  { sku: 'RC-DOG-ADULT-MED-15KG', sale_price: 485000 },
  { sku: 'RC-DOG-ADULT-MED-3KG', sale_price: 125000 },
  { sku: 'RC-DOG-PUPPY-MED-15KG', sale_price: 520000 },
  { sku: 'RC-DOG-PUPPY-MED-3KG', sale_price: 135000 },
  { sku: 'RC-CAT-ADULT-4KG', sale_price: 195000 },
  { sku: 'RC-CAT-KITTEN-4KG', sale_price: 210000 },
  { sku: 'HILLS-SD-ADULT-12KG', sale_price: 520000 },
  { sku: 'HILLS-SD-PUPPY-12KG', sale_price: 550000 },
  { sku: 'NEXGARD-S-3', sale_price: 145000 },
  { sku: 'NEXGARD-M-3', sale_price: 165000 },
  { sku: 'NEXGARD-L-3', sale_price: 180000 },
  { sku: 'NEXGARD-XL-3', sale_price: 195000 },
  { sku: 'BRAVECTO-S-1', sale_price: 185000 },
  { sku: 'BRAVECTO-M-1', sale_price: 210000 },
  { sku: 'BRAVECTO-L-1', sale_price: 235000 },
  { sku: 'BRAVECTO-XL-1', sale_price: 260000 },
  { sku: 'FRONTLINE-S-3', sale_price: 85000 },
  { sku: 'FRONTLINE-M-3', sale_price: 95000 },
  { sku: 'FRONTLINE-L-3', sale_price: 105000 },
  { sku: 'PP-DOG-ADULT-15KG', sale_price: 450000 },
  { sku: 'PP-DOG-PUPPY-15KG', sale_price: 480000 },
  { sku: 'PP-CAT-ADULT-7KG', sale_price: 295000 }
];

async function createAssignments() {
  try {
    await client.connect();
    console.log('Connected to database');

    for (const assignment of assignments) {
      try {
        // First get the product ID by SKU
        const productResult = await client.query('SELECT id FROM store_products WHERE sku = $1', [assignment.sku]);
        if (productResult.rows.length === 0) {
          console.log(`Product not found: ${assignment.sku}`);
          continue;
        }

        const productId = productResult.rows[0].id;

        // Insert assignment
        await client.query(`
          INSERT INTO clinic_product_assignments
          (tenant_id, catalog_product_id, sale_price, is_active)
          VALUES ($1, $2, $3, true)
          ON CONFLICT (tenant_id, catalog_product_id)
          DO UPDATE SET sale_price = EXCLUDED.sale_price
        `, ['adris', productId, assignment.sale_price]);

        console.log(`Created assignment for ${assignment.sku}`);
      } catch (err) {
        console.error(`Error creating assignment for ${assignment.sku}:`, err.message);
      }
    }

    console.log('Done creating assignments');
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await client.end();
  }
}

createAssignments();
