// backend/ratings.routes.js (CommonJS to match your db.js)
const express = require("express");
const cookieParser = require("cookie-parser");
const { randomUUID } = require("crypto");
const supabase = require("../db"); // <- your existing db.js

const router = express.Router();

router.use(cookieParser());

// anonymous identity via cookie (no login)
router.use((req, res, next) => {
  const name = "visitorId";
  let id = req.cookies?.[name];
  if (!id) {
    id = randomUUID();
    res.cookie(name, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }
  req.visitorId = id;
  next();
});

// helper: safely parse text_content to rating object or null
function parseRatingRow(row) {
  try {
    const obj = JSON.parse(row.text_content);
    if (!obj || obj.type !== "rating") return null;
    const r = Number(obj.rating);
    if (![1,2,3,4,5].includes(r)) return null;
    return {
      feedback_id: row.feedback_id,
      event_id: row.event_id,
      rating: r,
      comment: obj.comment ?? null,
      visitor: obj.visitor || null,
      created_at: row.created_at
    };
  } catch {
    return null; // plain-text feedback or invalid JSON
  }
}

// ----------------- POST /events/:eventId/ratings -----------------
router.post("/events/:eventId/ratings", async (req, res) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body || {};
  const r = Number(rating);
  if (![1,2,3,4,5].includes(r)) {
    return res.status(400).json({ error: "rating must be 1..5" });
  }

  const payload = {
    type: "rating",
    visitor: req.visitorId,
    rating: r,
    comment: comment ?? null
  };

  try {
    // 1) fetch existing ratings for this event
    const { data: rows, error: selErr } = await supabase
      .from("feedback")
      .select("feedback_id,event_id,text_content,created_at")
      .eq("event_id", eventId);

    if (selErr) throw selErr;

    // 2) find any previous rating rows by this visitor (in Node)
    const mine = (rows || [])
      .map(parseRatingRow)
      .filter(Boolean)
      .filter(x => x.visitor === req.visitorId);

    // 3) delete old ones (idempotent upsert)
    if (mine.length) {
      const ids = mine.map(x => x.feedback_id);
      const { error: delErr } = await supabase
        .from("feedback")
        .delete()
        .in("feedback_id", ids);
      if (delErr) throw delErr;
    }

    // 4) insert new rating row
    const newId = randomUUID();
    const { data: ins, error: insErr } = await supabase
      .from("feedback")
      .insert([{
        feedback_id: newId,             // safe if no default on PK
        event_id: eventId,
        text_content: JSON.stringify(payload),
        created_at: new Date().toISOString()
      }])
      .select("feedback_id")
      .single();

    if (insErr) throw insErr;
    return res.json({ message: "Saved", feedback_id: ins.feedback_id });
  } catch (e) {
    console.error("ratings upsert error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

// ----------------- GET /events/:eventId/ratings/me -----------------
router.get("/events/:eventId/ratings/me", async (req, res) => {
  const { eventId } = req.params;
  try {
    const { data: rows, error } = await supabase
      .from("feedback")
      .select("feedback_id,event_id,text_content,created_at")
      .eq("event_id", eventId);

    if (error) throw error;

    const mine = (rows || [])
      .map(parseRatingRow)
      .filter(Boolean)
      .filter(x => x.visitor === req.visitorId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!mine.length) return res.status(204).end();
    const latest = mine[0];
    return res.json({ rating: latest.rating, comment: latest.comment, created_at: latest.created_at });
  } catch (e) {
    console.error("ratings/me error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

// ----------------- GET /events/:eventId/ratings/summary -----------------
router.get("/events/:eventId/ratings/summary", async (req, res) => {
  const { eventId } = req.params;
  try {
    const { data: rows, error } = await supabase
      .from("feedback")
      .select("feedback_id,event_id,text_content,created_at")
      .eq("event_id", eventId);

    if (error) throw error;

    const ratings = (rows || [])
      .map(parseRatingRow)
      .filter(Boolean);

    const histogram = { "1":0, "2":0, "3":0, "4":0, "5":0 };
    let sum = 0;
    for (const x of ratings) {
      histogram[String(x.rating)]++;
      sum += x.rating;
    }
    const count = ratings.length;
    const average = count ? Number((sum / count).toFixed(2)) : null;

    return res.json({ average, count, histogram });
  } catch (e) {
    console.error("ratings/summary error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

// ----------------- DELETE /events/:eventId/ratings/me -----------------
router.delete("/events/:eventId/ratings/me", async (req, res) => {
  const { eventId } = req.params;
  try {
    const { data: rows, error } = await supabase
      .from("feedback")
      .select("feedback_id,event_id,text_content,created_at")
      .eq("event_id", eventId);

    if (error) throw error;

    const mine = (rows || [])
      .map(parseRatingRow)
      .filter(Boolean)
      .filter(x => x.visitor === req.visitorId);

    if (!mine.length) return res.status(204).end();

    const ids = mine.map(x => x.feedback_id);
    const { error: delErr } = await supabase
      .from("feedback")
      .delete()
      .in("feedback_id", ids);

    if (delErr) throw delErr;
    return res.status(204).end();
  } catch (e) {
    console.error("ratings delete error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

module.exports = router;

// GET /events/:eventId/ratings/all?limit=50&offset=0
router.get("/events/:eventId/ratings/all", async (req, res) => {
  const { eventId } = req.params;
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  try {
    const { data: rows, error } = await supabase
      .from("feedback")
      .select("feedback_id,event_id,text_content,created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1); // pagination

    if (error) throw error;

    const items = (rows || []).map(parseRatingRow).filter(Boolean);

    res.json({
      total: items.length + offset,   // simple total for the current page
      items
    });
  } catch (e) {
    console.error("ratings/all error:", e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports= router;