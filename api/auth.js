import mysql from 'mysql2/promise';

export const config = {
  runtime: 'edge',
  regions: ['iad1']
};

export default async function handler(req) {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': 'https://bitwisebrain.vercel.app',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    if (req.method === 'POST') {
      const body = await req.json();
      const { action, email, password } = body;

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
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Insert new user
        await connection.execute(
          'INSERT INTO users (email, password) VALUES (?, ?)',
          [email, password]
        );

        await connection.end();
        return new Response(
          JSON.stringify({ message: 'User registered successfully' }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'login') {
        const [users] = await connection.execute(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [email, password]
        );

        await connection.end();

        if (users.length > 0) {
          return new Response(
            JSON.stringify({ message: 'Login successful' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    await connection.end();
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 