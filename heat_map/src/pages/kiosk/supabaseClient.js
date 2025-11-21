import { createClient } from '@supabase/supabase-js'

// Use environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback values for development (optional)
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!')
  console.log('VITE_SUPABASE_URL:', supabaseUrl)
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
