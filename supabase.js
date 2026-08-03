import { createClient } from '@supabase/supabase-js'

// These two values come from your Supabase project settings (Settings -> API)
// We use environment variables so the actual keys are never hardcoded in the code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
