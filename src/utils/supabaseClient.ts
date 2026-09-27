import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ladwltzgxhrzekfkzxjj.supabase.co';
export const DEFAULT_SUPABASE_KEY = 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZHdsdHpnemhyemVrZmt6eGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTk5MDU0MiwiZXhwIjoyMTA1NTY2NTQyfQ.OLG63cLcT-N_0vCyOB0qbIUO4VxSrfQegG-ABIZ1858';

export const getSupabaseKey = (): string => {
  try {
    const customKey = localStorage.getItem('chartebet_supabase_key');
    if (customKey && customKey.trim()) return customKey.trim();
  } catch (e) {}
  return DEFAULT_SUPABASE_KEY;
};

export const setSupabaseKey = (key: string) => {
  try {
    localStorage.setItem('chartebet_supabase_key', key.trim());
    supabaseInstance = null; // Reset to force re-instantiation
  } catch (e) {}
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, getSupabaseKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

/**
 * Checks connection health to Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    // Test a basic request
    const { error } = await supabase.from('charte_bets').select('id', { count: 'exact', head: true });
    const latency = Date.now() - startTime;
    
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // If error is not "table does not exist", it might be an auth or network issue
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          message: `Connected to Supabase project ladwltzgxhrzekfkzxjj in ${latency}ms (tables ready to create).`,
          latencyMs: latency,
        };
      }
      return {
        success: false,
        message: `Supabase returned: ${error.message}`,
        latencyMs: latency,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase PostgreSQL (ladwltzgxhrzekfkzxjj) in ${latency}ms!`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Connection failed',
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * SQL Schema script to run in Supabase SQL editor
 */
export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS charte_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user',
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS charte_bets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL,
  game_type TEXT NOT NULL,
  stake NUMERIC NOT NULL,
  potential_win NUMERIC NOT NULL,
  total_odds NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  games JSONB NOT NULL DEFAULT '[]'::jsonb,
  placed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS charte_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_phone TEXT,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  receipt_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;
