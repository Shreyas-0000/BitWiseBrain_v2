import mysql from '@vercel/mysql';

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { action, email, password } = body;

      // Create database connection
      const db = await mysql({
        config: {
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT
        }
      });

      if (action === 'register') {
        // Check if user exists
        const existingUsers = await db.query(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );

        if (existingUsers.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Email already exists' }),
            { status: 400, headers }
          );
        }

        // Insert new user
        await db.query(
          'INSERT INTO users (email, password) VALUES (?, ?)',
          [email, password]
        );

        return new Response(
          JSON.stringify({ 
            message: 'User registered successfully',
            debug: { email }
          }),
          { status: 201, headers }
        );
      }

      if (action === 'login') {
        const users = await db.query(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [email, password]
        );
        
        if (users.length > 0) {
          return new Response(
            JSON.stringify({ message: 'Login successful' }),
            { status: 200, headers }
          );
        } else {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers }
          );
        }
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