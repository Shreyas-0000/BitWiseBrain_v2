const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP password is empty
    database: 'quiz_db' // your database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    // Check if user exists
    const checkUser = "SELECT * FROM users WHERE username = ?";
    db.query(checkUser, [username], (err, result) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        
        if (result.length > 0) {
            res.status(400).json({ error: "Username already exists" });
            return;
        }

        // Insert new user
        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(sql, [username, password], (err, result) => {
            if (err) {
                res.status(500).json({ error: "Error registering user" });
                return;
            }
            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        
        if (result.length > 0) {
            res.json({ message: "Login successful" });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 