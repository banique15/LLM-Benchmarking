import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with auto-refresh options
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Function to refresh schema cache
export const refreshSchemaCache = async () => {
  try {
    // Force a schema refresh by making a metadata query on a table we know exists
    await supabase.from('benchmarks').select('*').limit(0);
    console.log('Schema cache refreshed successfully');
  } catch (error) {
    console.error('Error refreshing schema cache:', error);
  }
};

// Refresh schema cache on initialization
refreshSchemaCache();

export default supabase; 