import { kv } from '@vercel/kv';

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

      if (action === 'register') {
        // Check if user exists
        const existingUser = await kv.get(`user:${email}`);

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'Email already exists' }),
            { status: 400, headers }
          );
        }

        // Store new user
        await kv.set(`user:${email}`, { 
          email, 
          password,
          createdAt: new Date().toISOString()
        });

        return new Response(
          JSON.stringify({ 
            message: 'User registered successfully',
            debug: { email }
          }),
          { status: 201, headers }
        );
      }

      if (action === 'login') {
        const user = await kv.get(`user:${email}`);
        
        if (user && user.password === password) {
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