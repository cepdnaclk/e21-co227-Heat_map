// backend/fetchAndSyncEvents.js
// Periodically fetch event data from external API and update Supabase
'ts-check'
const axios = require('axios');
const supabase = require('./db');


const API_BASE_URL = process.env.EVENT_API_BASE_URL || 'http://localhost:5000'; // Set your baseurl here or via env

const FETCH_INTERVAL_MINUTES = 0.5; // How often to fetch (in minutes)

async function fetchEventsFromAPI() {
    try {
        const response = await axios.get(`${API_BASE_URL}/events/`);
        return response.data;
    } catch (err) {
        console.error('Failed to fetch events from API:', err.message);
        return null;
    }
}

async function upsertEventsToSupabase(events) {
    if (!Array.isArray(events)) return;
    for (const event of events) {
        // Map API fields to Supabase fields as needed
        const eventData = {
            event_id: event.event_id,
            event_title: event.event_name,
            description: event.description,
            location: event.location,
            start_time: event.start_time,
            end_time: event.end_time,
        };
        // Upsert (insert or update) event
        const { error } = await supabase
            .from('events')
            .upsert([eventData], { onConflict: ['event_id'] });
        if (error) {
            console.error(`Failed to upsert event ${event.event_id}:`, error.message);
        }
    }
    console.log(`Upserted ${events.length} events to Supabase.`);
}

async function syncEvents() {
    console.log(`[${new Date().toISOString()}] Fetching events from API...`);
    const events = await fetchEventsFromAPI();
    if (events) {
        await upsertEventsToSupabase(events);
    }
}

// Run periodically
setInterval(syncEvents, FETCH_INTERVAL_MINUTES * 60 * 1000);

// Run once on start
syncEvents();

module.exports = { syncEvents };
