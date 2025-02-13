export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    return new Response(
      JSON.stringify({ 
        message: 'API endpoint working!',
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Something went wrong',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers }
    );
  }
} 