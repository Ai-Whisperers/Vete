import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export async function setupTestDatabase() {
  try {
    // Create a new database for testing
    const { data, error } = await supabase.from('databases').insert([
      {
        name: 'test_database',
        owner: 'test_owner',
      },
    ]);

    if (error) {
      throw error;
    }

    const testDatabase = data[0];

    // Create a new schema for the test database
    const { data: schemaData, error: schemaError } = await supabase
      .from('schemas')
      .insert([
        {
          name: 'public',
          database_id: testDatabase.id,
        },
      ]);

    if (schemaError) {
      throw schemaError;
    }

    const schema = schemaData[0];

    // Create tables for the test database
    await createTables(supabase, testDatabase.id, schema.id);

    return testDatabase;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createTables(supabase: Database, databaseId: number, schemaId: number) {
  // Create tables for the test database
  const tables = [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'integer' },
        { name: 'email', type: 'text' },
        { name: 'password', type: 'text' },
      ],
    },
    {
      name: 'appointments',
      columns: [
        { name: 'id', type: 'integer' },
        { name: 'user_id', type: 'integer' },
        { name: 'date', type: 'timestamp' },
      ],
    },
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from('tables')
      .insert([
        {
          name: table.name,
          database_id: databaseId,
          schema_id: schemaId,
        },
      ]);

    if (error) {
      throw error;
    }

    const createdTable = data[0];

    for (const column of table.columns) {
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .insert([
          {
            name: column.name,
            type: column.type,
            table_id: createdTable.id,
          },
        ]);

      if (columnError) {
        throw columnError;
      }
    }
  }
}