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

    // Call RunPod API - Updated endpoint
    const response = await fetch('https://3fg3p55cngmmn1-8888.proxy.runpod.net/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message, // API expects 'query' field based on documentation
        history: history || [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    const data = await response.json();

    // Response format: { success: true, response: "AI response", sources: [...] }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: data.response || data.message, // Support both response formats
        sources: data.sources || [],
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
