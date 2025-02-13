import mysql from 'mysql2/promise';

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    // Log environment variables (sanitized)
    console.log('Testing connection with:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.end();

    return new Response(
      JSON.stringify({ 
        message: 'Database connection successful!',
        test: rows[0].test,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to connect to database',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers }
    );
  }
} 