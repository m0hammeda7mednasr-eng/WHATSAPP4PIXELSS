// Send Message Function for Netlify
const { createClient } = require('@supabase/supabase-js');
console.log("SUPABASE URL =", process.env.VITE_SUPABASE_URL);
console.log("SUPABASE KEY EXISTS =", !!process.env.VITE_SUPABASE_ANON_KEY);

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
      console.log('✅ Message sent successfully:', result.messages?.[0]?.id);
      return result;
    } else {
      console.error('❌ Message send failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Send error:', error);
    return null;
  }
}

exports.handler = async (event, context) => {
  console.log('📤 Send message function called');
  
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

    const { brandId, contactId, message, messageType = 'text' } = JSON.parse(event.body);
    
    console.log('📤 Send message request:', { brandId, contactId, messageType });
    
    if (!supabase) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not available' }),
      };
    }
    
    // Get brand info
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();
      
    if (brandError || !brand) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Brand not found' }),
      };
    }
    
    // Get contact info
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();
      
    if (contactError || !contact) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Contact not found' }),
      };
    }
    
    // Prepare message
    let whatsappMessage;
    if (messageType === 'text') {
      whatsappMessage = {
        type: 'text',
        text: { body: message }
      };
    } else if (messageType === 'interactive') {
      whatsappMessage = message; // Assume message is already formatted
    }
    
    // Send message
    const result = await sendWhatsAppMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      contact.wa_id,
      whatsappMessage
    );
    
    if (result) {
      // Save to database
      const { error: saveError } = await supabase
        .from('messages')
        .insert({
          contact_id: contactId,
          brand_id: brandId,
          direction: 'outbound',
          message_type: messageType,
          body: messageType === 'text' ? message : JSON.stringify(message),
          wa_message_id: result.messages?.[0]?.id,
          status: 'sent'
        });
        
      if (saveError) {
        console.error('❌ Error saving message:', saveError);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          messageId: result.messages?.[0]?.id,
          message: 'Message sent successfully'
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
    console.error('❌ Send message error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
