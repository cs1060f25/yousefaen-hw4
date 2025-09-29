# County Data API

API prototype for querying county health data based on ZIP codes.

## Files Structure

```
├── netlify/
│   └── functions/
│       └── county_data.js    # Main API endpoint
├── data.db                   # SQLite database from Part 1
├── package.json              # Node.js dependencies
├── netlify.toml              # Netlify configuration
└── test_api.js               # Local test script
```

## API Endpoint

**POST** `/.netlify/functions/county_data`

### Request Format
```json
{
  "zip": "02138",
  "measure_name": "Adult obesity"
}
```

### Valid Measure Names
- Violent crime rate
- Unemployment
- Children in poverty
- Diabetic screening
- Mammography screening
- Preventable hospital stays
- Uninsured
- Sexually transmitted infections
- Physical inactivity
- Adult obesity
- Premature Death
- Daily fine particulate matter

### Response Codes
- **200**: Success - returns array of county health data
- **400**: Bad request - missing or invalid parameters
- **404**: Not found - no data for ZIP/measure combination
- **418**: I'm a teapot - when `coffee=teapot` is provided

### Special Cases
- Send `coffee=teapot` to get HTTP 418 response

## Testing Locally

```bash
npm install
node test_api.js
```

## Deployment to Netlify

1. **Push to GitHub repository**
2. **Connect to Netlify**:
   - Go to netlify.com
   - "New site from Git"
   - Select your repository
   - Build settings are in `netlify.toml`
3. **Deploy**:
   - Netlify will automatically build and deploy
   - Database file (`data.db`) is included via `netlify.toml`

## Testing the Live API

```bash
# Valid request
curl -H'content-type:application/json' \
  -d'{"zip":"02138","measure_name":"Adult obesity"}' \
  https://your-site.netlify.app/.netlify/functions/county_data

# Test 418 response
curl -H'content-type:application/json' \
  -d'{"zip":"02138","measure_name":"Adult obesity","coffee":"teapot"}' \
  https://your-site.netlify.app/.netlify/functions/county_data
```

## Implementation Notes

- Uses SQLite3 for database access
- Joins `zip_county` and `county_health_rankings` tables
- Parameterized queries prevent SQL injection
- CORS enabled for browser access
- All inputs validated and sanitized