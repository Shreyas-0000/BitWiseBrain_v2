import mysql from 'mysql2/promise';

export const config = {
  runtime: 'nodejs18'  // or 'nodejs16'
};

export default async function handler(req, res) {
  try {
    console.log('Testing connection with:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.end();

    return res.status(200).json({ 
      message: 'Database connection successful!',
      test: rows[0].test,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to database',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 