import mysql from 'mysql2/promise';

export const config = {
  runtime: 'edge'
};

// Temporary in-memory storage (replace with proper DB later)
const users = new Map();

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Received request:', body);

      const { action, email, password } = body;

      // Create database connection
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      });

      if (action === 'register') {
        // Check if user exists
        const [users] = await connection.execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );

        if (users.length > 0) {
          await connection.end();
          return new Response(
            JSON.stringify({ error: 'Email already exists' }),
            { status: 400, headers }
          );
        }

        // Insert new user
        await connection.execute(
          'INSERT INTO users (email, password) VALUES (?, ?)',
          [email, password]
        );

        await connection.end();
        return new Response(
          JSON.stringify({ 
            message: 'User registered successfully',
            debug: { email }
          }),
          { status: 201, headers }
        );
      }

      if (action === 'login') {
        // For testing, just return success
        return new Response(
          JSON.stringify({ message: 'Login successful' }),
          { status: 200, headers }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers }
      );
    } catch (error) {
      console.error('API error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          details: error.message 
        }),
        { status: 500, headers }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers }
  );
} 