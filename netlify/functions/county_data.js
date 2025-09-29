const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const VALID_MEASURES = [
  'Violent crime rate',
  'Unemployment',
  'Children in poverty',
  'Diabetic screening',
  'Mammography screening',
  'Preventable hospital stays',
  'Uninsured',
  'Sexually transmitted infections',
  'Physical inactivity',
  'Adult obesity',
  'Premature Death',
  'Daily fine particulate matter'
];

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Not found' })
    };
  }

  try {
    // Parse JSON body
    const data = JSON.parse(event.body || '{}');

    // Check for coffee=teapot (highest priority)
    if (data.coffee === 'teapot') {
      return {
        statusCode: 418,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: "I'm a teapot" })
      };
    }

    // Validate required fields
    if (!data.zip || !data.measure_name) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Bad request - zip and measure_name are required' })
      };
    }

    // Validate zip format (5 digits)
    if (!/^\d{5}$/.test(data.zip)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Bad request - zip must be 5 digits' })
      };
    }

    // Validate measure_name
    if (!VALID_MEASURES.includes(data.measure_name)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Bad request - invalid measure_name' })
      };
    }

    // Database query
    const dbPath = path.join(process.cwd(), 'data.db');

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          resolve({
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Database connection failed' })
          });
          return;
        }

        // Join zip_county and county_health_rankings tables
        const query = `
          SELECT chr.*
          FROM zip_county zc
          JOIN county_health_rankings chr ON zc.county = chr.county AND zc.state_abbreviation = chr.state
          WHERE zc.zip = ? AND chr.measure_name = ?
        `;

        db.all(query, [data.zip, data.measure_name], (err, rows) => {
          db.close();

          if (err) {
            resolve({
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'Database query failed' })
            });
            return;
          }

          if (rows.length === 0) {
            resolve({
              statusCode: 404,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'No data found for the specified zip and measure' })
            });
            return;
          }

          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(rows)
          });
        });
      });
    });

  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }
};