const express = require('express');
const router = express.Router();
const pool = require('../../../../db/db.js');

// ==============================
// GET ALL BUILDINGS
// ==============================
const getBuildings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT building_ID, zone_ID, building_name, description, exhibits, exhibit_tags
      FROM Building
      ORDER BY building_ID
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET BUILDING BY ID
// ==============================
const getBuildingById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT building_ID, zone_ID, building_name, description, exhibits, exhibit_tags
       FROM Building
       WHERE building_ID = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching building:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// CREATE A NEW BUILDING
// ==============================
const createBuilding = async (req, res) => {
  const { building_id, zone_id, building_name, description, exhibits, exhibit_tags } = req.body;

  if (building_id === undefined || building_id === null || !zone_id || !building_name) {
    return res.status(400).json({ message: 'building_id, zone_id and building_name are required' });
  }

  // Validate that building_id is a valid positive integer
  if (typeof building_id !== 'number' || !Number.isInteger(building_id) || building_id <= 0) {
    return res.status(400).json({ message: 'building_id must be a valid positive integer' });
  }

  // Validate that zone_id is a valid positive integer
  if (typeof zone_id !== 'number' || !Number.isInteger(zone_id) || zone_id <= 0) {
    return res.status(400).json({ message: 'zone_id must be a valid positive integer' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO Building (building_ID, zone_ID, building_name, description, exhibits, exhibit_tags)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)
         RETURNING building_ID, zone_ID, building_name, description, exhibits, exhibit_tags`,
        [building_id, zone_id, building_name, description || null, exhibits || null, exhibit_tags ? JSON.stringify(exhibit_tags) : null]
      );

      // Maintain Exhibit_Tag_Map if exhibit_tags provided
      if (exhibit_tags && typeof exhibit_tags === 'object') {
        const entries = Object.entries(exhibit_tags);
        for (const [exhibitName, tag] of entries) {
          if (!exhibitName || !tag) continue;
          await client.query(
            `INSERT INTO Exhibit_Tag_Map (building_ID, exhibit_name, tag)
             VALUES ($1, $2, $3)`,
            [building_id, exhibitName, String(tag)]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Building created successfully', building: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') {  // unique violation
      if (err.constraint === 'building_pkey') {
        return res.status(409).json({ message: 'Building ID already exists' });
      } else if (err.constraint && err.constraint.includes('building_name')) {
        return res.status(409).json({ message: 'Building name must be unique' });
      }
    }
    console.error('Error creating building:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// UPDATE A BUILDING
// ==============================
const updateBuilding = async (req, res) => {
  const { id } = req.params;
  const { zone_id, building_name, description, exhibits, exhibit_tags } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE Building
         SET zone_ID = COALESCE($1, zone_ID),
             building_name = COALESCE($2, building_name),
             description = COALESCE($3, description),
             exhibits = COALESCE($4, exhibits),
             exhibit_tags = COALESCE($5::jsonb, exhibit_tags)
         WHERE building_ID = $6
         RETURNING building_ID, zone_ID, building_name, description, exhibits, exhibit_tags`,
        [zone_id || null, building_name || null, description || null, exhibits || null, exhibit_tags ? JSON.stringify(exhibit_tags) : null, id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Building not found' });
      }

      // Refresh Exhibit_Tag_Map if exhibit_tags provided
      if (exhibit_tags && typeof exhibit_tags === 'object') {
        await client.query(`DELETE FROM Exhibit_Tag_Map WHERE building_ID = $1`, [id]);
        const entries = Object.entries(exhibit_tags);
        for (const [exhibitName, tag] of entries) {
          if (!exhibitName || !tag) continue;
          await client.query(
            `INSERT INTO Exhibit_Tag_Map (building_ID, exhibit_name, tag)
             VALUES ($1, $2, $3)`,
            [id, exhibitName, String(tag)]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Building updated successfully', building: result.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') {  // unique violation
      return res.status(409).json({ message: 'Building name must be unique' });
    }
    console.error('Error updating building:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// DELETE A BUILDING
// ==============================
const deleteBuilding = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM Building
       WHERE building_ID = $1
       RETURNING building_ID, zone_ID, building_name, description, exhibits`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json({ message: 'Building deleted successfully', building: result.rows[0] });
  } catch (err) {
    console.error('Error deleting building:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET BUILDINGS BY TAG
// ==============================
const getBuildingsByTag = async (req, res) => {
  const { tag } = req.query;

  // If no tag is provided, return all buildings
  if (!tag) {
    return getBuildings(req, res);
  }

  try {
    // Filter at DB level to only include exhibits whose tag list contains the exact tag (case-insensitive)
    const result = await pool.query(
      `
      SELECT
        b.building_ID  AS building_id,
        b.building_name,
        b.zone_ID      AS zone_id,
        -- only include exhibit tag entries that match the tag
        jsonb_object_agg(j.key, j.value) AS exhibit_tags,
        array_agg(j.key)                 AS exhibits
      FROM Building b
      CROSS JOIN LATERAL (
        SELECT key, value
        FROM jsonb_each(COALESCE(b.exhibit_tags, '{}'::jsonb))
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(value) v(val)
          WHERE LOWER(val) = LOWER($1)
        )
      ) j
      GROUP BY b.building_ID, b.building_name, b.zone_ID
      `,
      [tag]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No exhibits found with the given tag' });
    }

    // Results are already filtered and shaped by SQL
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buildings by tag:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// TAGS LIST
// ==============================
router.get('/tags', (req, res) => {
  res.json({
    tags: ['AI', 'Robotics', 'Mechanics', 'Civil', 'Electronics', 'Computer Science', 'Chemical', 'Manufacturing']
  });
});

// Export functions
module.exports = {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingsByTag  // Add the new function to the export
};
