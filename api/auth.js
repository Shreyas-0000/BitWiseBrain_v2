const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://bitwisebrain.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { action, username, password } = req.body;

            // Create database connection
            const connection = await mysql.createConnection(dbConfig);

            if (action === 'register') {
                // Check if user exists
                const [users] = await connection.execute(
                    'SELECT * FROM users WHERE username = ?',
                    [username]
                );

                if (users.length > 0) {
                    await connection.end();
                    return res.status(400).json({ error: 'Username already exists' });
                }

                // Insert new user
                await connection.execute(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    [username, password]
                );

                await connection.end();
                return res.status(201).json({ message: 'User registered successfully' });
            }

            if (action === 'login') {
                const [users] = await connection.execute(
                    'SELECT * FROM users WHERE username = ? AND password = ?',
                    [username, password]
                );

                await connection.end();

                if (users.length > 0) {
                    return res.status(200).json({ message: 'Login successful' });
                } else {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
            }
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
} 