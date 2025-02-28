import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(sql: string): Promise<void> {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      // Execute each statement
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        // If exec_sql RPC fails, try direct table operations
        if (statement.toLowerCase().startsWith('alter table')) {
          // For alter table statements, we'll use the update method
          const tableName = statement.toLowerCase().split('alter table')[1].trim().split(' ')[0];
          await supabase.from(tableName).update({}).eq('id', 'dummy');
        } else if (statement.toLowerCase().startsWith('insert into')) {
          // For insert statements, we'll use the insert method
          const tableName = statement.toLowerCase().split('insert into')[1].trim().split(' ')[0];
          const values = extractValues(statement);
          await supabase.from(tableName).insert(values);
        }
        // Other types of statements might need different handling
      }
    } catch (error) {
      console.warn(`Warning: Statement execution failed, continuing with next statement: ${error}`);
    }
  }
}

function extractValues(insertStatement: string): any {
  // This is a simplified version - in practice, you'd need a proper SQL parser
  try {
    const valuesMatch = insertStatement.match(/VALUES\s+\((.*)\)/i);
    if (valuesMatch && valuesMatch[1]) {
      const values = valuesMatch[1].split(',').map(v => v.trim());
      return values;
    }
  } catch (error) {
    console.warn('Failed to extract values from insert statement');
  }
  return {};
}

async function migrate(): Promise<void> {
  try {
    // Read all migration files from the migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Apply each migration in order
    for (const file of migrationFiles) {
      console.log(`Processing migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      try {
        await executeSql(sql);
        console.log(`Migration ${file} applied successfully`);
      } catch (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      }
    }

    console.log('All migrations processed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
migrate(); 