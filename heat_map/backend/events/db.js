const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();  // loads .env

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY  // use service key for server-side operations
);

module.exports = supabase;