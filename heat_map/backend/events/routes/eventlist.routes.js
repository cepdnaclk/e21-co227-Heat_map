// backend/routes/events.routes.js
const express = require('express');
const supabase = require('../db');

const router = express.Router();

// GET /api/events -> list all events with their categories
router.get('/', async (req, res) => {
    try {
        // Join events, event_categories, and categories to get category name for each event
        const { data, error } = await supabase
            .from('events')
            .select(`event_id, event_title, start_time, end_time, location, event_categories(category_id, category:categories(category_id, category_name))`)
            .order('start_time', { ascending: true });

        if (error) throw error;

        // Map all categories for each event into an array
        const eventsWithCategories = (data || []).map(event => {
            let categories = [];
            if (event.event_categories && event.event_categories.length > 0) {
                categories = event.event_categories
                    .filter(ec => ec && ec.category)
                    .map(ec => ({
                        category_id: ec.category.category_id,
                        category_name: ec.category.category_name,
                    }));
            }
            return { ...event, categories };
        });

        res.json(eventsWithCategories);
    } catch (err) {
        console.error('Supabase fetch error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
