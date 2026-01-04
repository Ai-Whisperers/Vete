#!/usr/bin/env node

const fs = require('fs')
const { Client } = require('pg')

// Database connection details from your environment
const connectionString =
  'postgresql://postgres:VetePlatform2024!@db.okddppczckbjdotrxiev.supabase.co:5432/postgres'

async function executeSeed() {
  const client = new Client({ connectionString })

  try {
    console.log('🔄 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully')

    console.log('📄 Reading seed SQL file...')
    const sqlContent = fs.readFileSync('db/seeds/generated-seed.sql', 'utf8')

    console.log('🚀 Executing seed data...')
    await client.query(sqlContent)

    console.log('✅ Seed data executed successfully!')
    console.log('🎉 Your veterinary platform is now populated with sample data!')
  } catch (error) {
    console.error('❌ Error executing seed data:', error.message)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

executeSeed()
