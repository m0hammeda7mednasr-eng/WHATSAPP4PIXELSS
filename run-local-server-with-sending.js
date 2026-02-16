// Local Development Server with Real Message Sending
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('ℹ️  dotenv not available, using environment variables');
}

// Try to load Supabase
let supabase;
try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://rmpgofswkpjxionzythf.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM'
  );
  console.log('✅ Supabase client initialized');
} catch (error) {
  console.log('⚠️  Supabase not available:', error.message);
}

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

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

// Auto reply function
async function sendAutoReply(incomingMessage, brand) {
  try {
    const replyMessage = {
      type: 'text',
      text: {
        body: `مرحباً! 👋

شكراً لتواصلك مع ${brand.name}

تم استلام رسالتك وسنرد عليك في أقرب وقت ممكن.

⏰ الوقت: ${new Date().toLocaleString('ar-EG')}
✅ الحالة: تم الاستلام

شكراً لثقتك بنا! 🙏`
      }
    };
    
    console.log('📤 Sending auto reply...');
    const result = await sendWhatsAppMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      incomingMessage.from,
      replyMessage
    );
    
    if (result) {
      console.log('✅ Auto reply sent successfully');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Auto reply error:', error);
    return null;
  }
}

// Handle order confirmation
async function handleOrderConfirmation(buttonId, from, brand) {
  try {
    const orderId = buttonId.replace('confirm_', '');
    
    const confirmMessage = {
      type: 'text',
      text: {
        body: `✅ تم تأكيد طلبك بنجاح!

📦 رقم الطلب: #${orderId}

سيتم تجهيز طلبك وشحنه في أقرب وقت ممكن.

📞 للاستفسار: اتصل بنا
🚚 التوصيل: خلال 2-3 أيام عمل

شكراً لثقتك في ${brand.name}! 🙏`
      }
    };
    
    console.log('📤 Sending order confirmation...');
    const result = await sendWhatsAppMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      from,
      confirmMessage
    );
    
    if (result) {
      console.log('✅ Order confirmation sent');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Order confirmation error:', error);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Webhook endpoint
  if (url.pathname === '/api/webhook') {
    console.log(`📥 Webhook request: ${req.method} ${url.pathname}`);
    
    if (req.method === 'GET') {
      // Webhook verification
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      console.log('🔐 Verification request:', { mode, token, challenge });
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(challenge);
      } else {
        console.log('❌ Webhook verification failed');
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden' }));
      }
      return;
    }
    
    if (req.method === 'POST') {
      // Process webhook messages
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          console.log('📨 Webhook data received:');
          console.log(JSON.stringify(data, null, 2));
          
          // Process WhatsApp messages
          if (data.object === 'whatsapp_business_account') {
            const entry = data.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            
            if (value?.metadata?.phone_number_id && supabase) {
              // Find brand by phone_number_id
              const { data: brand } = await supabase
                .from('brands')
                .select('*')
                .eq('phone_number_id', value.metadata.phone_number_id)
                .single();
                
              if (brand && value.messages) {
                for (const message of value.messages) {
                  console.log('💬 Message received:', {
                    id: message.id,
                    from: message.from,
                    type: message.type,
                    body: message.text?.body || message.interactive?.button_reply?.title || 'Non-text message'
                  });
                  
                  // Send auto reply for text messages
                  if (message.type === 'text') {
                    await sendAutoReply(message, brand);
                  }
                  
                  // Handle button clicks
                  if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
                    const buttonId = message.interactive.button_reply.id;
                    const buttonTitle = message.interactive.button_reply.title;
                    console.log('🔘 Button clicked:', { buttonId, buttonTitle });
                    
                    if (buttonId.startsWith('confirm_')) {
                      console.log('✅ Processing order confirmation...');
                      await handleOrderConfirmation(buttonId, message.from, brand);
                    } else if (buttonId.startsWith('cancel_')) {
                      console.log('❌ Processing order cancellation...');
                      // Add cancellation logic here
                    }
                  }
                }
              } else {
                console.log('⚠️  Brand not found or no messages');
              }
            }
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Webhook processed with real message sending',
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('❌ Webhook processing error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Processing failed' }));
        }
      });
      return;
    }
  }
  
  // Send message endpoint
  if (url.pathname === '/api/send-message') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { brandId, contactId, message, messageType = 'text' } = JSON.parse(body);
          
          console.log('📤 Send message request:', { brandId, contactId, messageType });
          
          if (!supabase) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database not available' }));
            return;
          }
          
          // Get brand info
          const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('*')
            .eq('id', brandId)
            .single();
            
          if (brandError || !brand) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Brand not found' }));
            return;
          }
          
          // Get contact info
          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', contactId)
            .single();
            
          if (contactError || !contact) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Contact not found' }));
            return;
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
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              messageId: result.messages?.[0]?.id,
              message: 'Message sent successfully'
            }));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to send message' }));
          }
          
        } catch (error) {
          console.error('❌ Send message error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
      return;
    }
  }
  
  // External message endpoint
  if (url.pathname === '/api/external-message') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { phone_number_id, to, message } = JSON.parse(body);
          
          console.log('📤 External message request:', { phone_number_id, to });
          
          if (!supabase) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database not available' }));
            return;
          }
          
          // Get brand by phone_number_id
          const { data: brand } = await supabase
            .from('brands')
            .select('*')
            .eq('phone_number_id', phone_number_id)
            .single();
            
          if (!brand) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Brand not found' }));
            return;
          }
          
          // Send message
          const result = await sendWhatsAppMessage(
            phone_number_id,
            brand.whatsapp_token,
            to,
            message
          );
          
          if (result) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              messageId: result.messages?.[0]?.id 
            }));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to send message' }));
          }
          
        } catch (error) {
          console.error('❌ External message error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
      return;
    }
  }

  // Test endpoint
  if (url.pathname === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK',
      message: 'Local server with real message sending',
      timestamp: new Date().toISOString(),
      supabase: supabase ? 'Connected' : 'Not available',
      features: ['Real message sending', 'Auto replies', 'Button handling', 'Send message API', 'External message API']
    }));
    return;
  }
  
  // Serve static files (same as before)
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>404 - الصفحة غير موجودة</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { background: white; padding: 40px; border-radius: 10px; display: inline-block; }
                h1 { color: #25D366; margin-bottom: 20px; }
                a { color: #25D366; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404 - الصفحة غير موجودة</h1>
                <p>الصفحة التي تبحث عنها غير موجودة</p>
                <p><a href="/">العودة للصفحة الرئيسية</a></p>
            </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <title>500 - خطأ في الخادم</title>
      </head>
      <body>
          <div style="text-align: center; padding: 50px;">
              <h1>500 - خطأ في الخادم</h1>
              <p>حدث خطأ في الخادم</p>
          </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`
🎉 LOCAL WHATSAPP CRM SERVER WITH REAL MESSAGING!
================================================
✅ Frontend: http://localhost:${PORT}
✅ Webhook: http://localhost:${PORT}/api/webhook
✅ Test API: http://localhost:${PORT}/api/test

🔧 Webhook Configuration:
========================
URL: http://localhost:${PORT}/api/webhook
Verify Token: ${VERIFY_TOKEN}

📱 NEW FEATURES:
===============
✅ Real message sending
✅ Auto replies to text messages
✅ Order confirmation handling
✅ Button click responses
✅ Database integration

🚀 READY FOR REAL WHATSAPP TESTING!
===================================
Press Ctrl+C to stop the server
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});