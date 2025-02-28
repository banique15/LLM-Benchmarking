import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
  try {
    // Read and execute reset SQL
    const resetSql = fs.readFileSync(path.join(__dirname, 'reset.sql'), 'utf-8');
    await supabase.rpc('exec_sql', { sql: resetSql });
    console.log('Database reset complete');

    // Read and execute schema SQL
    const schemaSql = fs.readFileSync(path.join(__dirname, 'migrations/000_initial_schema.sql'), 'utf-8');
    await supabase.rpc('exec_sql', { sql: schemaSql });
    console.log('Schema created');

    // Run all other migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.startsWith('000_'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await supabase.rpc('exec_sql', { sql });
      console.log(`Migration ${file} applied successfully`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase(); 