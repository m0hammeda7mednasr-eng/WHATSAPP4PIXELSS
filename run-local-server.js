// Local Development Server for WhatsApp CRM
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables if .env exists
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
            
            if (value?.messages) {
              for (const message of value.messages) {
                console.log('💬 Message received:', {
                  id: message.id,
                  from: message.from,
                  type: message.type,
                  body: message.text?.body || message.interactive?.button_reply?.title || 'Non-text message'
                });
                
                // Handle button clicks
                if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
                  const buttonId = message.interactive.button_reply.id;
                  const buttonTitle = message.interactive.button_reply.title;
                  console.log('🔘 Button clicked:', { buttonId, buttonTitle });
                  
                  // Simulate order fulfillment for testing
                  if (buttonId.startsWith('confirm_')) {
                    console.log('✅ Simulating order confirmation and fulfillment...');
                    console.log('📦 Order would be fulfilled in production');
                  } else if (buttonId.startsWith('cancel_')) {
                    console.log('❌ Simulating order cancellation...');
                  }
                }
              }
            }
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Webhook processed locally',
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
  
  // Test endpoint
  if (url.pathname === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK',
      message: 'Local server is running',
      timestamp: new Date().toISOString(),
      supabase: supabase ? 'Connected' : 'Not available'
    }));
    return;
  }
  
  // Serve static files
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
      // 404 page
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
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; display: inline-block; }
              h1 { color: #dc3545; margin-bottom: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>500 - خطأ في الخادم</h1>
              <p>حدث خطأ في الخادم</p>
              <p>Error: ${error.message}</p>
          </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`
🎉 LOCAL WHATSAPP CRM SERVER RUNNING!
====================================
✅ Frontend: http://localhost:${PORT}
✅ Webhook: http://localhost:${PORT}/api/webhook
✅ Test API: http://localhost:${PORT}/api/test

🔧 Webhook Configuration (for testing):
======================================
URL: http://localhost:${PORT}/api/webhook
Verify Token: ${VERIFY_TOKEN}

📱 Features Available:
====================
✅ Static file serving
✅ Webhook verification
✅ Message processing
✅ Button click handling
✅ CORS enabled
✅ Error handling

Press Ctrl+C to stop the server
===============================
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