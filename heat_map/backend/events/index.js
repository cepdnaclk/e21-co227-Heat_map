const express = require("express");
// Start periodic event sync
require("./fetchAndSyncEvents");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const supabase = require("./db");
const cors = require("cors");

// routes
const eventRoutes = require("./routes/events.routes");
const ratingsRoutes = require("./routes/ratings.routes");
const eventListRoutes = require("./routes/eventlist.routes");

const interestsRouter = require("./routes/interests.routes");

const userinterestsRouter = require("./routes/userinterests.routes");


const app = express();
const PORT = process.env.PORT || process.env.BACKEND_EVENTS_SERVICE_PORT || 3036;

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// Set a stable userId cookie if missing
app.use((req, res, next) => {
    if (!req.cookies.userId) {
        res.cookie("userId", uuidv4(), {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 31536000000, // 1 year
            path: "/",
        });
    }
    next();
});

// ------------------- TEST ROUTE -------------------
app.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .limit(8);
        if (error) throw error;
        res.send({ message: "✅ Connected to Supabase!", sampleRows: data });
    } catch (err) {
        console.error("❌ Supabase error:", err.message);
        res.status(500).send("Connection failed!");
    }
});

// ------------------- USE ROUTES -------------------
// Mount more specific /api/events/* routes before /api/events/:id
app.use("/api", interestsRouter); // includes /events/recommended, /events/discover, etc.
app.use("/api/events", eventListRoutes); // /api/events list
app.use("/api", ratingsRoutes);

app.use("/api", eventRoutes); // includes /events/:id and related


app.use("/api/interests", userinterestsRouter);



// ------------------- START SERVER -------------------

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
