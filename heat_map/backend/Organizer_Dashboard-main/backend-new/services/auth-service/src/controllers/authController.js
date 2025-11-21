// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../../../db/db.js'); // PostgreSQL connection pool
const { sendApprovalEmail } = require('../utils/sendApproveEmail');
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL; // set this in your .env

// ======================
// REGISTER (Organizer)
// ======================
const register = async (req, res) => {
    try {
        const { fname, lname, email, contact_no, password } = req.body;

        if (!fname || !lname || !email || !password) {
            return res.status(400).json({ message: "fname, lname, Email (username) and Password are required" });
        }

        // Check if email (username) already exists
        const existingUser = await pool.query('SELECT * FROM Organizer WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email (username) already registered" });
        }

        // Generate organizer_name from fname and lname
        const organizer_name = `${fname} ${lname}`;

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);


        // Insert new organizer with status 'pending'
        const result = await pool.query(
            `INSERT INTO Organizer (organizer_name, fname, lname, email, contact_no, password_hash, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING organizer_ID, organizer_name, fname, lname, email AS username, contact_no, status`,
            [organizer_name, fname, lname, email, contact_no || null, password_hash, 'pending']
        );

        // Send approval email to admin - use unified server URL with auth proxy
        // const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
        // const approvalLink = `${baseUrl}/auth/approve/${result.rows[0].organizer_id}`;
        const approvalLink = `${process.env.BASE_URL}/auths/approve/${result.rows[0].organizer_id}`;
        await sendApprovalEmail(ADMIN_EMAIL, {
            organizer_name,
            email
        }, approvalLink);

        res.status(201).json({ 
            message: "Registration request sent for admin approval.",
            organizer: result.rows[0]
        });

    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// ======================
// LOGIN (Organizer)
// ======================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email (username) and Password are required" });
        }


        // Find organizer
        const userResult = await pool.query('SELECT * FROM Organizer WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email (username) or password" });
        }

        const user = userResult.rows[0];

        // Check if approved
        if (user.status !== 'approved') {
            return res.status(403).json({ message: "Account not approved by admin yet." });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email (username) or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.organizer_ID, username: user.email }, // use email as username
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: "Login successful", token });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

module.exports = { register, login };