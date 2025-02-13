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

      if (action === 'register') {
        // For testing, just return success
        return new Response(
          JSON.stringify({ 
            message: 'User registered successfully',
            debug: { email, action }
          }),
          { 
            status: 201, 
            headers 
          }
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