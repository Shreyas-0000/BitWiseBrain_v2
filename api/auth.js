export const config = {
  runtime: 'edge'
};

// Temporary in-memory storage (replace with proper DB later)
const users = new Map();

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'https://bitwisebrain.vercel.app',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const { action, email, password } = body;

      if (action === 'register') {
        // Check if user exists
        if (users.has(email)) {
          return new Response(
            JSON.stringify({ error: 'Email already exists' }),
            { status: 400, headers }
          );
        }

        // Store new user
        users.set(email, { password });

        return new Response(
          JSON.stringify({ 
            message: 'User registered successfully',
            debug: `Total users: ${users.size}`
          }),
          { status: 201, headers }
        );
      }

      if (action === 'login') {
        const user = users.get(email);
        
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
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
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