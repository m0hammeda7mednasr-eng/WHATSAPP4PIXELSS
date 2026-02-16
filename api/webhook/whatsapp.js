import { createClient } from '@supabase/supabase-js';

export const config = { runtime: "nodejs" };

// Supabase Client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ✅ WhatsApp verification
  if (req.method === "GET") {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // ✅ Incoming messages
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const body = req.body;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages?.[0];
    const contacts = value?.contacts?.[0];

    if (!messages) {
      return res.status(200).json({ success: true, message: 'No message to process' });
    }

    const wa_id = messages.from;
    const phone_number_id = value?.metadata?.phone_number_id;
    const message_type = messages.type;
    const wa_message_id = messages.id;
    const timestamp = messages.timestamp;

    // Extract message text
    let body_text = '';
    let media_url = null;

    if (message_type === 'text') {
      body_text = messages.text?.body || '';
    } else if (message_type === 'image') {
      body_text = messages.image?.caption || '[صورة]';
      media_url = messages.image?.id;
    } else if (message_type === 'video') {
      body_text = messages.video?.caption || '[فيديو]';
      media_url = messages.video?.id;
    } else if (message_type === 'audio') {
      body_text = '[رسالة صوتية]';
      media_url = messages.audio?.id;
    } else if (message_type === 'document') {
      body_text = messages.document?.filename || '[مستند]';
      media_url = messages.document?.id;
    } else if (message_type === 'interactive') {
      const buttonReply = messages.interactive?.button_reply;
      const listReply = messages.interactive?.list_reply;

      if (buttonReply) {
        body_text = buttonReply.title || '';
        const buttonId = buttonReply.id;

        console.log('🔘 Interactive Button clicked:', buttonId);

        // Handle button click for Shopify orders
        try {
          // Import and call button handler
          const { handleButtonClick } = await import('../shopify/handle-button-click.js');
          const result = await handleButtonClick(buttonId, wa_id, phone_number_id);
          console.log('✅ Button handled:', result);
        } catch (buttonError) {
          console.error('❌ Button handling error:', buttonError);
          // Continue to save message even if button handling fails
        }
      } else if (listReply) {
        body_text = listReply.title || '';
      }
    } else if (message_type === 'button') {
      // Handle Template button replies (quick_reply)
      const buttonPayload = messages.button?.payload;
      const buttonText = messages.button?.text;

      if (buttonPayload) {
        body_text = buttonText || buttonPayload;
        
        console.log('🔘 Template Button clicked:', buttonPayload);

        // Handle button click for Shopify orders
        try {
          const { handleButtonClick } = await import('../shopify/handle-button-click.js');
          const result = await handleButtonClick(buttonPayload, wa_id, phone_number_id);
          console.log('✅ Template button handled:', result);
        } catch (buttonError) {
          console.error('❌ Template button handling error:', buttonError);
        }
      } else {
        body_text = buttonText || '[زر]';
      }
    } else {
      body_text = `[${message_type}]`;
    }

    const contact_name = contacts?.profile?.name || wa_id;

    // 1) Get brand by phone_number_id
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('phone_number_id', phone_number_id)
      .single();

    if (brandError || !brandData) {
      return res.status(200).json({
        success: false,
        error: 'Brand not found',
        note: 'Please add this phone_number_id to brands table'
      });
    }

    const brand_id = brandData.id;

    // 2) Upsert contact
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id,
        wa_id,
        name: contact_name,
        last_message_at: new Date().toISOString()
      }, { onConflict: 'brand_id,wa_id' })
      .select()
      .single();

    if (contactError) {
      return res.status(500).json({ success: false, error: contactError.message });
    }

    // 3) Save inbound message
    const created_at = timestamp
      ? new Date(parseInt(timestamp, 10) * 1000).toISOString()
      : new Date().toISOString();

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contactData.id,
        brand_id,
        direction: 'inbound',
        message_type,
        body: body_text,
        media_url,
        status: 'delivered',
        wa_message_id,
        created_at
      })
      .select()
      .single();

    if (messageError) {
      return res.status(500).json({ success: false, error: messageError.message });
    }

    return res.status(200).json({
      success: true,
      message_id: messageData.id,
      contact_id: contactData.id,
      brand_id
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
