// utils/approveOrganizer.js
const pool = require('../../../../db/db.js');
const { sendOrganizerApprovedEmail } = require('./notificationEmail');

// Admin approval endpoint
const approveOrganizer = async (req, res) => {
    try {
        const { organizerId } = req.params;
        const result = await pool.query(
            'UPDATE Organizer SET status = $1 WHERE organizer_ID = $2 RETURNING *',
            ['approved', organizerId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Organizer not found' });
        }

    //const organizer = result.rows[0];    

    // Send email to organizer
    await sendOrganizerApprovedEmail(result.rows[0]);
    res.json({ message: 'Organizer approved successfully', organizer: result.rows[0] });
    } catch (err) {
        console.error('Approve Organizer Error:', err.message);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = { approveOrganizer };
