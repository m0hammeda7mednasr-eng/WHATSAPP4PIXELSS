// External Message Function for Netlify
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase;
try {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
} catch (error) {
  console.error('❌ Supabase initialization error:', error);
}

// Send WhatsApp message function
async function sendWhatsAppMessage(phoneNumberId, token, to, message) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          ...message
        })
      }
    );
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ External message sent successfully:', result.messages?.[0]?.id);
      return result;
    } else {
      console.error('❌ External message send failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ External send error:', error);
    return null;
  }
}

exports.handler = async (event, context) => {
  console.log('📤 External message function called');
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No body provided' }),
      };
    }

    const { phone_number_id, to, message } = JSON.parse(event.body);
    
    console.log('📤 External message request:', { phone_number_id, to });
    
    if (!supabase) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not available' }),
      };
    }
    
    // Get brand by phone_number_id
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('phone_number_id', phone_number_id)
      .single();
      
    if (!brand) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Brand not found' }),
      };
    }
    
    // Send message
    const result = await sendWhatsAppMessage(
      phone_number_id,
      brand.whatsapp_token,
      to,
      message
    );
    
    if (result) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          messageId: result.messages?.[0]?.id 
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to send message' }),
      };
    }
    
  } catch (error) {
    console.error('❌ External message error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};