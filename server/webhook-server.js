// WhatsApp Webhook Server - مدمج مع الـ App
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client - Direct configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set these environment variables:');
  console.error('- VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Starting WhatsApp Webhook Server...');
console.log('📍 Supabase URL:', SUPABASE_URL);

// ============================================
// WhatsApp Webhook - استقبال الرسائل
// ============================================
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    console.log('\n📨 Received WhatsApp webhook');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const body = req.body;
    
    // استخراج بيانات الرسالة
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages?.[0];
    const contacts = value?.contacts?.[0];

    // لو مفيش رسالة، ارجع success
    if (!messages) {
      console.log('⚠️  No message found in webhook');
      return res.status(200).json({ success: true, message: 'No message to process' });
    }

    // بيانات الرسالة
    const wa_id = messages.from; // رقم العميل
    const phone_number_id = value.metadata?.phone_number_id; // رقم البيزنس
    const message_type = messages.type;
    const wa_message_id = messages.id;
    const timestamp = messages.timestamp;

    console.log('📱 Message from:', wa_id);
    console.log('📞 Business phone:', phone_number_id);
    console.log('📝 Type:', message_type);

    // استخراج نص الرسالة حسب النوع
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
      // Handle button clicks
      const buttonReply = messages.interactive?.button_reply;
      const listReply = messages.interactive?.list_reply;
      
      if (buttonReply) {
        body_text = buttonReply.title || '';
        const buttonId = buttonReply.id;
        
        console.log('🔘 Button clicked:', buttonId);
        
        // Import and handle button click
        try {
          const { handleButtonClick } = await import('../api/shopify/handle-button-click.js');
          const result = await handleButtonClick(buttonId, wa_id, phone_number_id);
          console.log('✅ Button handled:', result);
        } catch (error) {
          console.error('❌ Button handling error:', error);
        }
      } else if (listReply) {
        body_text = listReply.title || '';
      }
    }

    const contact_name = contacts?.profile?.name || wa_id;

    console.log('💬 Message:', body_text);
    console.log('👤 Contact:', contact_name);

    // 1. جيب الـ brand_id من phone_number_id
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('phone_number_id', phone_number_id)
      .single();

    if (brandError || !brandData) {
      console.error('❌ Brand not found for phone_number_id:', phone_number_id);
      console.error('Error:', brandError);
      
      // لو مفيش brand، ارجع success عشان WhatsApp ميعيدش الرسالة
      return res.status(200).json({ 
        success: false, 
        error: 'Brand not found',
        note: 'Please add this phone_number_id to brands table'
      });
    }

    const brand_id = brandData.id;
    console.log('✅ Brand found:', brandData.name, '(', brand_id, ')');

    // 2. أنشئ أو حدّث الـ contact
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id,
        wa_id,
        name: contact_name,
        last_message_at: new Date().toISOString()
      }, {
        onConflict: 'brand_id,wa_id'
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Contact error:', contactError);
      return res.status(500).json({ success: false, error: contactError.message });
    }

    const contact_id = contactData.id;
    console.log('✅ Contact created/updated:', contact_name, '(', contact_id, ')');

    // 3. احفظ الرسالة
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id,
        brand_id,
        direction: 'inbound',
        message_type,
        body: body_text,
        media_url,
        status: 'delivered',
        wa_message_id,
        created_at: new Date(parseInt(timestamp) * 1000).toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Message error:', messageError);
      return res.status(500).json({ success: false, error: messageError.message });
    }

    console.log('✅ Message saved:', messageData.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // رد على WhatsApp
    res.status(200).json({ 
      success: true, 
      message_id: messageData.id,
      contact_id: contact_id,
      brand_id: brand_id
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// WhatsApp Webhook Verification
// ============================================
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

  console.log('🔐 Webhook verification request');
  console.log('Mode:', mode);
  console.log('Token:', token);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// ============================================
// إرسال رسالة لـ WhatsApp
// ============================================
app.post('/api/send-message', async (req, res) => {
  try {
    const { contact_id, brand_id, message, user_id, media_url, message_type = 'text' } = req.body;

    console.log('\n📤 Sending message...');
    console.log('Contact ID:', contact_id);
    console.log('Brand ID:', brand_id);
    console.log('Message:', message);

    // احفظ الرسالة مباشرة في الـ database (بدون WhatsApp API)
    const wa_message_id = 'local_' + Date.now();

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id,
        brand_id,
        direction: 'outbound',
        message_type: message_type,
        body: message || (message_type === 'audio' ? '[Voice message]' : `[${message_type}]`),
        media_url: media_url,
        status: 'sent',
        wa_message_id: wa_message_id
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Failed to save message:', messageError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save message to database',
        details: messageError.message
      });
    }

    console.log('✅ Message saved to database:', messageData.id);

    res.json({ 
      success: true, 
      message_id: messageData.id,
      wa_message_id: wa_message_id,
      mode: 'local_only'
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }

// ============================================
// إرسال رسالة من n8n أو External Automation
// ============================================
app.post('/api/external-message', async (req, res) => {
  try {
    const { 
      phone_number,      // رقم العميل (مثال: 201012345678)
      message,           // نص الرسالة
      brand_id,          // معرف البراند (اختياري)
      phone_number_id,   // Phone Number ID من Meta (اختياري)
      media_url,         // رابط الميديا (اختياري)
      message_type = 'text'  // نوع الرسالة (text, image, audio, video, document)
    } = req.body;

    console.log('\n📨 External message request from n8n/automation');
    console.log('Phone:', phone_number);
    console.log('Message:', message);
    console.log('Type:', message_type);

    // التحقق من البيانات المطلوبة
    if (!phone_number || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: phone_number and message' 
      });
    }

    // تنظيف رقم الهاتف
    let wa_id = phone_number.replace(/[^\d]/g, '');
    if (wa_id.startsWith('+')) {
      wa_id = wa_id.substring(1);
    }

    console.log('📱 Cleaned phone:', wa_id);

    // 1. جيب الـ brand (إما من brand_id أو phone_number_id)
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
      // لو مفيش brand_id ولا phone_number_id، جيب أول brand
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .limit(1)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ 
          success: false, 
          error: 'No brands found. Please create a brand first.' 
        });
      }
      brand = data;
    }

    console.log('✅ Brand found:', brand.name);

    // 2. أنشئ أو جيب الـ contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id: brand.id,
        wa_id: wa_id,
        name: wa_id, // هنستخدم الرقم كاسم مؤقت
        last_message_at: new Date().toISOString()
      }, {
        onConflict: 'brand_id,wa_id'
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Contact error:', contactError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create/get contact: ' + contactError.message 
      });
    }

    console.log('✅ Contact found/created:', contact.name);

    // 3. ابعت الرسالة لـ WhatsApp API
    let wa_message_id = null;
    
    if (brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here') {
      console.log('📤 Sending to WhatsApp API...');
      
      // بناء الـ payload حسب نوع الرسالة
      let whatsappPayload = {
        messaging_product: 'whatsapp',
        to: wa_id,
        type: message_type
      };

      if (message_type === 'text') {
        whatsappPayload.text = { body: message };
      } else if (message_type === 'image' && media_url) {
        whatsappPayload.image = {
          link: media_url,
          caption: message || ''
        };
      } else if (message_type === 'audio' && media_url) {
        whatsappPayload.audio = { link: media_url };
      } else if (message_type === 'video' && media_url) {
        whatsappPayload.video = {
          link: media_url,
          caption: message || ''
        };
      } else if (message_type === 'document' && media_url) {
        whatsappPayload.document = {
          link: media_url,
          caption: message || '',
          filename: message || 'document'
        };
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
        console.error('❌ WhatsApp API error:', whatsappData);
        return res.status(500).json({ 
          success: false, 
          error: whatsappData.error?.message || 'Failed to send message to WhatsApp',
          details: whatsappData
        });
      }

      wa_message_id = whatsappData.messages?.[0]?.id;
      console.log('✅ Message sent to WhatsApp:', wa_message_id);
    } else {
      console.log('⚠️  WhatsApp token not configured');
      return res.status(400).json({ 
        success: false, 
        error: 'WhatsApp token not configured for this brand. Please configure it in Settings.' 
      });
    }

    // 4. احفظ الرسالة في الـ database
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        brand_id: brand.id,
        direction: 'outbound',
        message_type: message_type,
        body: message || (message_type === 'audio' ? '[Voice message]' : `[${message_type}]`),
        media_url: media_url,
        status: 'sent',
        wa_message_id: wa_message_id
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Failed to save message:', messageError);
      return res.status(500).json({ 
        success: false, 
        error: 'Message sent to WhatsApp but failed to save in database',
        details: messageError.message
      });
    }

    console.log('✅ Message saved to database:', messageData.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({ 
      success: true, 
      message_id: messageData.id,
      wa_message_id: wa_message_id,
      contact_id: contact.id,
      brand_id: brand.id,
      message: 'Message sent and saved successfully'
    });

  } catch (error) {
    console.error('❌ External message error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase: process.env.VITE_SUPABASE_URL ? 'connected' : 'not configured'
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || process.env.WEBHOOK_PORT || 3001;
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 WhatsApp Webhook Server is running!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Webhook: /webhook/whatsapp`);
  console.log(`📍 Health: /health`);
  console.log(`📍 Supabase: ${SUPABASE_URL || 'Not configured'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
