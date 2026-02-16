// Vercel Serverless Function - External Message (for n8n)
import { createClient } from '@supabase/supabase-js';
export const config = {
  runtime: "nodejs"
};


const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      phone_number,
      message,
      brand_id,
      phone_number_id,
      media_url,
      message_type = 'text'
    } = req.body;

    if (!phone_number || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: phone_number and message' 
      });
    }

    // Clean phone number
    let wa_id = phone_number.replace(/[^\d]/g, '');

    // 1. Get brand
    let brand;
    if (brand_id) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brand_id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ 
          success: false, 
          error: 'Brand not found with id: ' + brand_id 
        });
      }
      brand = data;
    } else if (phone_number_id) {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('phone_number_id', phone_number_id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ 
          success: false, 
          error: 'Brand not found with phone_number_id: ' + phone_number_id 
        });
      }
      brand = data;
    } else {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .limit(1)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ 
          success: false, 
          error: 'No brands found' 
        });
      }
      brand = data;
    }

    // 2. Create/get contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id: brand.id,
        wa_id: wa_id,
        name: wa_id,
        last_message_at: new Date().toISOString()
      }, {
        onConflict: 'brand_id,wa_id'
      })
      .select()
      .single();

    if (contactError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create/get contact' 
      });
    }

    // 3. Send to WhatsApp
    let wa_message_id = null;
    
    if (brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here') {
      let whatsappPayload = {
        messaging_product: 'whatsapp',
        to: wa_id,
        type: message_type
      };

      if (message_type === 'text') {
        whatsappPayload.text = { body: message };
      } else if (message_type === 'image' && media_url) {
        whatsappPayload.image = { link: media_url, caption: message || '' };
      } else if (message_type === 'audio' && media_url) {
        whatsappPayload.audio = { link: media_url };
      } else if (message_type === 'video' && media_url) {
        whatsappPayload.video = { link: media_url, caption: message || '' };
      } else if (message_type === 'document' && media_url) {
        whatsappPayload.document = { link: media_url, caption: message || '', filename: message || 'document' };
      }
      
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${brand.whatsapp_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(whatsappPayload)
        }
      );

      const whatsappData = await whatsappResponse.json();

      if (!whatsappResponse.ok) {
        return res.status(500).json({ 
          success: false, 
          error: whatsappData.error?.message || 'Failed to send message to WhatsApp'
        });
      }

      wa_message_id = whatsappData.messages?.[0]?.id;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'WhatsApp token not configured' 
      });
    }

    // 4. Save message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        brand_id: brand.id,
        direction: 'outbound',
        message_type: message_type,
        body: message || `[${message_type}]`,
        media_url: media_url,
        status: 'sent',
        wa_message_id: wa_message_id
      })
      .select()
      .single();

    if (messageError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Message sent but failed to save in database'
      });
    }

    res.json({ 
      success: true, 
      message_id: messageData.id,
      wa_message_id: wa_message_id,
      contact_id: contact.id,
      brand_id: brand.id
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
