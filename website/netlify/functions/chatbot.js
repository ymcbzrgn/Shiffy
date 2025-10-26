// Netlify serverless function for RunPod proxy
// File: netlify/functions/chatbot.js

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, history } = JSON.parse(event.body);

    // Call RunPod API
    const response = await fetch('https://3fg3p55cngmmn1-8888.proxy.runpod.net/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No API key needed - CORS is open
      },
      body: JSON.stringify({
        query: message, // Updated parameter name
        history: history || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: data.message,
      }),
    };

  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
};
