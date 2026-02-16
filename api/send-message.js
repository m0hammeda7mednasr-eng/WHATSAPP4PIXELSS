// Send Message API for Vercel
import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req, res) {
  console.log('📤 Send message API called');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandId, contactId, message, messageType = 'text' } = req.body;
    
    console.log('📤 Send message request:', { brandId, contactId, messageType });
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    // Get brand info
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();
      
    if (brandError || !brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    // Get contact info
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();
      
    if (contactError || !contact) {
      return res.status(404).json({ error: 'Contact not found' });
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
      
      return res.status(200).json({ 
        success: true, 
        messageId: result.messages?.[0]?.id,
        message: 'Message sent successfully'
      });
    } else {
      return res.status(500).json({ error: 'Failed to send message' });
    }
    
  } catch (error) {
    console.error('❌ Send message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}