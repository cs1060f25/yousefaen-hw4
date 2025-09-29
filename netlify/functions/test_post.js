exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      method: event.httpMethod,
      headers: event.headers,
      body: event.body,
      bodyType: typeof event.body,
      parsedBody: event.body ? JSON.parse(event.body) : null
    })
  };
};