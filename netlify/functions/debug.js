const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const dbPath = path.join(process.cwd(), 'data.db');

    // Check if data.db exists
    const dbExists = fs.existsSync(dbPath);

    // List files in current directory
    const files = fs.readdirSync(process.cwd());

    // Try to access better-sqlite3
    let sqliteStatus = 'not installed';
    try {
      require('better-sqlite3');
      sqliteStatus = 'installed and accessible';
    } catch (err) {
      sqliteStatus = `error: ${err.message}`;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        cwd: process.cwd(),
        dbPath: dbPath,
        dbExists: dbExists,
        files: files.slice(0, 20), // First 20 files only
        nodeVersion: process.version,
        sqliteStatus: sqliteStatus
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};