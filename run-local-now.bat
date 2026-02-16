@echo off
title WhatsApp CRM - Local Development
color 0A

echo.
echo ██╗      ██████╗  ██████╗ █████╗ ██╗     
echo ██║     ██╔═══██╗██╔════╝██╔══██╗██║     
echo ██║     ██║   ██║██║     ███████║██║     
echo ██║     ██║   ██║██║     ██╔══██║██║     
echo ███████╗╚██████╔╝╚██████╗██║  ██║███████╗
echo ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝
echo.
echo           WHATSAPP CRM - LOCAL DEVELOPMENT
echo           ==================================
echo           تشغيل محلي على localhost
echo.

echo 🚀 Starting Local Development Server...
echo =======================================

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Creating .env file...
    echo VITE_SUPABASE_URL=https://rmpgofswkpjxionzythf.supabase.co > .env
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM >> .env
    echo WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024 >> .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 📋 STEP 1: Starting Simple HTTP Server
echo ======================================

echo 🌐 Starting HTTP server on port 3000...
echo.
echo 🔗 LOCAL URLS:
echo ==============
echo ✅ Frontend: http://localhost:3000
echo ✅ Webhook: http://localhost:3000/api/webhook
echo.

REM Start simple HTTP server using Node.js
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const PORT = 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'whatsapp_crm_2024';

// Initialize Supabase
let supabase;
try {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  console.log('✅ Supabase connected');
} catch (error) {
  console.error('❌ Supabase connection failed:', error);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  
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
    console.log(\`📥 Webhook request: \${req.method} \${url.pathname}\`);
    
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
          console.log('📨 Webhook data received:', JSON.stringify(data, null, 2));
          
          // Simple response for now
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Webhook processed locally' }));
        } catch (error) {
          console.error('❌ Webhook processing error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Processing failed' }));
        }
      });
      return;
    }
  }
  
  // Serve static files
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>');
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>500 - Server Error</h1>');
  }
});

server.listen(PORT, () => {
  console.log(\`\`);
  console.log(\`🎉 LOCAL SERVER RUNNING!\`);
  console.log(\`========================\`);
  console.log(\`✅ Frontend: http://localhost:\${PORT}\`);
  console.log(\`✅ Webhook: http://localhost:\${PORT}/api/webhook\`);
  console.log(\`\`);
  console.log(\`🔧 For Meta Webhook (testing only):\`);
  console.log(\`URL: http://localhost:\${PORT}/api/webhook\`);
  console.log(\`Token: \${VERIFY_TOKEN}\`);
  console.log(\`\`);
  console.log(\`Press Ctrl+C to stop the server\`);
  console.log(\`===============================\`);
});
"

echo.
echo 🎉 Server stopped
echo ================
pause