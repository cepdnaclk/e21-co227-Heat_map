import { supabase } from '../supabaseClient'

// Get all events from backend API
export async function getAllEvents() {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const response = await fetch(`${apiUrl}/api/events`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📋 API Response:', data)
    
    return data
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

// Get events for today
export async function getTodayEvents() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const { data, error } = await supabase
      .from('events')
      .select('event_id, event_title, description, location, start_time, end_time')
      .gte('start_time', startOfDay.toISOString())
      .lt('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true })
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error fetching today events:', error)
    throw error
  }
}

// Get upcoming events
export async function getUpcomingEvents(limit = 10) {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('events')
      .select('event_id, event_title, description, location, start_time, end_time')
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    throw error
  }
}

// Get events that are ongoing or will start within an hour from current time
export async function getEventsWithinHour() {
  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000))
    
    const { data, error } = await supabase
      .from('events')
      .select('event_id, event_title, description, location, start_time, end_time')
      .lte('start_time', oneHourFromNow.toISOString())
      .gte('end_time', now.toISOString())
      .order('start_time', { ascending: true })
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error fetching events within hour:', error)
    throw error
  }
}