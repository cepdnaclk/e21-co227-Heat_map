import { supabase } from './supabaseClient'

// Test basic Supabase connection
export async function testBasicConnection() {
  try {
    console.log('Testing basic Supabase connection...')
    
    // Try to access Supabase auth (this should always work if connection is valid)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && !error.message.includes('Invalid JWT') && !error.message.includes('JWT')) {
      console.error('Connection error:', error.message)
      return { connected: false, error: error.message }
    }
    
    console.log('✓ Basic connection successful')
    return { connected: true, user: user || 'No authenticated user' }
  } catch (err) {
    console.error('Connection failed:', err.message)
    return { connected: false, error: err.message }
  }
}

// Test connection and check if events table exists
export async function testConnection() {
  try {
    console.log('Testing events table...')
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Events table test result:', error.message)
      return { connected: true, hasEventsTable: false, error: error.message }
    }
    
    console.log('✓ Events table exists and accessible')
    return { connected: true, hasEventsTable: true, sampleData: data }
  } catch (err) {
    console.error('Events table test failed:', err.message)
    return { connected: false, error: err.message }
  }
}

// Check for existing tables
export async function listTables() {
  const commonTables = ['events', 'users', 'schedules', 'exhibitions', 'workshops', 'profiles', 'sessions']
  const existingTables = []
  
  console.log('Checking for existing tables...')
  
  for (const tableName of commonTables) {
    try {
      const { Data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)
      
      if (!error) {
        console.log(`✓ Table '${tableName}' exists`)
        existingTables.push({ table_name: tableName, status: 'exists' })
      } else {
        console.log(`✗ Table '${tableName}' not accessible:`, error.message)
      }
    } catch (err) {
      console.log(`✗ Table '${tableName}' check failed:`, err.message)
    }
  }
  
  return existingTables
}

// Run complete test
export async function runCompleteTest() {
  console.log('=== Running Complete Database Test ===')
  
  // Test basic connection
  const basicTest = await testBasicConnection()
  console.log('Basic connection result:', basicTest)
  
  if (!basicTest.connected) {
    return { success: false, error: 'Basic connection failed', details: basicTest }
  }
  
  // Check for existing tables
  const tables = await listTables()
  console.log('Existing tables:', tables)
  
  // Test events table specifically
  const eventsTest = await testConnection()
  console.log('Events table test:', eventsTest)
  
  return {
    success: true,
    basicConnection: basicTest,
    existingTables: tables,
    eventsTable: eventsTest
  }
}