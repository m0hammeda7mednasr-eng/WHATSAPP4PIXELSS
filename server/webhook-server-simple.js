// Simple WhatsApp Webhook Server
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Supabase
const SUPABASE_URL = 'https://rmpgofswkpjxionzythf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Starting Server...');
console.log('📍 Supabase:', SUPABASE_URL);

// Send Message API
app.post('/api/send-message', async (req, res) => {
  try {
    const { contact_id, brand_id, message, media_url, message_type = 'text' } = req.body;

    console.log('\n📤 Sending message...');
    console.log('Contact ID:', contact_id);
    console.log('Brand ID:', brand_id);
    console.log('Message:', message);

    // Get contact info
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('wa_id, name')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      console.error('❌ Contact not found');
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    console.log('✅ Contact:', contact.name, '(', contact.wa_id, ')');

    // Get brand info (WhatsApp credentials)
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('phone_number_id, whatsapp_token')
      .eq('id', brand_id)
      .single();

    if (brandError || !brand) {
      console.error('❌ Brand not found');
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    let wa_message_id = 'local_' + Date.now();

    // Send to WhatsApp if token exists
    if (brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here') {
      console.log('📤 Sending to WhatsApp API...');
      
      try {
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${brand.whatsapp_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: contact.wa_id,
              type: 'text',
              text: { body: message }
            })
          }
        );

        const whatsappData = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
          console.error('❌ WhatsApp API error:', whatsappData);
          return res.status(500).json({ 
            success: false, 
            error: whatsappData.error?.message || 'Failed to send to WhatsApp',
            details: whatsappData
          });
        }

        wa_message_id = whatsappData.messages?.[0]?.id;
        console.log('✅ Sent to WhatsApp:', wa_message_id);
      } catch (whatsappError) {
        console.error('❌ WhatsApp error:', whatsappError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to send to WhatsApp: ' + whatsappError.message
        });
      }
    } else {
      console.log('⚠️  No WhatsApp token - saving locally only');
    }

    // Save message to database
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id,
        brand_id,
        direction: 'outbound',
        message_type,
        body: message,
        media_url,
        status: 'sent',
        wa_message_id
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error:', messageError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save message',
        details: messageError.message
      });
    }

    console.log('✅ Message saved:', messageData.id);

    res.json({ 
      success: true, 
      message_id: messageData.id,
      wa_message_id,
      mode: brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here' ? 'whatsapp_sent' : 'local_only'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// WhatsApp Webhook - Verification
// ============================================
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = 'whatsapp_crm_2024';

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
// WhatsApp Webhook - Receive Messages
// ============================================
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    console.log('\n📨 Received WhatsApp webhook');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const body = req.body;
    
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages?.[0];
    const contacts = value?.contacts?.[0];

    if (!messages) {
      console.log('⚠️  No message found in webhook');
      return res.status(200).json({ success: true, message: 'No message to process' });
    }

    const wa_id = messages.from;
    const phone_number_id = value.metadata?.phone_number_id;
    const message_type = messages.type;
    const wa_message_id = messages.id;
    const timestamp = messages.timestamp;

    console.log('📱 Message from:', wa_id);
    console.log('📞 Business phone:', phone_number_id);
    console.log('📝 Type:', message_type);

    let body_text = '';
    let media_url = null;

    // Handle button clicks (Interactive Messages)
    if (message_type === 'interactive') {
      const buttonReply = messages.interactive?.button_reply;
      const buttonId = buttonReply?.id;
      
      console.log('🔘 Button clicked:', buttonReply?.title);
      console.log('🆔 Button ID:', buttonId);
      
      if (buttonId) {
        // Extract action and order ID from button ID
        const [action, orderId] = buttonId.split('_');
        
        // Find brand by phone_number_id
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('phone_number_id', phone_number_id)
          .single();

        if (brandError || !brandData) {
          console.error('❌ Brand not found for phone_number_id:', phone_number_id);
          return res.status(200).json({ success: false, error: 'Brand not found' });
        }

        // Find contact
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('*')
          .eq('brand_id', brandData.id)
          .eq('wa_id', wa_id)
          .single();

        if (contactError || !contactData) {
          console.error('❌ Contact not found');
          return res.status(200).json({ success: false, error: 'Contact not found' });
        }

        if (action === 'confirm') {
          await handleOrderConfirmation(orderId, contactData, brandData);
        } else if (action === 'cancel') {
          await handleOrderCancellation(orderId, contactData, brandData);
        }
      }
      
      return res.status(200).json({ success: true });
    }

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
    }

    const contact_name = contacts?.profile?.name || wa_id;

    console.log('💬 Message:', body_text);
    console.log('👤 Contact:', contact_name);

    // Find brand by phone_number_id
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('phone_number_id', phone_number_id)
      .single();

    if (brandError || !brandData) {
      console.error('❌ Brand not found for phone_number_id:', phone_number_id);
      return res.status(200).json({ 
        success: false, 
        error: 'Brand not found'
      });
    }

    const brand_id = brandData.id;
    console.log('✅ Brand found:', brandData.name);

    // Create or update contact
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
    console.log('✅ Contact created/updated:', contact_name);

    // Save message
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

    res.status(200).json({ 
      success: true, 
      message_id: messageData.id
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Shopify OAuth - Start Installation
// ============================================
app.get('/api/shopify/oauth/install', async (req, res) => {
  try {
    const { shop, brand_id, client_id, client_secret } = req.query;

    console.log('🔐 Starting Shopify OAuth for:', shop);

    if (!shop || !brand_id || !client_id || !client_secret) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: shop, brand_id, client_id, client_secret' 
      });
    }

    // Scopes needed
    const scopes = [
      'read_orders',
      'write_orders',
      'read_products',
      'read_customers',
      'write_fulfillments'
    ].join(',');

    // Callback URL with credentials
    const redirectUri = `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/shopify/oauth/callback?client_id=${client_id}&client_secret=${encodeURIComponent(client_secret)}`;

    // Build Shopify OAuth URL (state is just brand_id)
    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${client_id}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${brand_id}`;

    console.log('✅ Redirecting to Shopify OAuth...');
    console.log('📍 Callback URL:', redirectUri);

    res.redirect(authUrl);

  } catch (error) {
    console.error('❌ OAuth install error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Shopify OAuth - Callback
// ============================================
app.get('/api/shopify/oauth/callback', async (req, res) => {
  try {
    const { code, state, shop } = req.query;

    console.log('📥 OAuth callback received:', { shop, hasCode: !!code, state });

    if (!code || !state || !shop) {
      throw new Error('Missing required OAuth parameters');
    }

    // Decode state data
    let stateData;
    try {
      const decodedState = Buffer.from(state, 'base64').toString('utf-8');
      stateData = JSON.parse(decodedState);
      console.log('✅ State decoded successfully');
    } catch (err) {
      console.error('❌ Failed to decode state:', err);
      throw new Error('Invalid OAuth state');
    }

    const { brandId, clientId, clientSecret } = stateData;

    if (!brandId || !clientId || !clientSecret) {
      throw new Error('Invalid OAuth state data - missing credentials');
    }

    console.log('🔍 Brand ID:', brandId);
    console.log('🔑 Client ID:', clientId.substring(0, 10) + '...');

    // Get brand
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (brandError || !brand) {
      console.error('❌ Brand not found:', brandId);
      throw new Error('Brand not found');
    }

    console.log('✅ Brand found:', brand.name);

    console.log('🔐 Exchanging code for access token...');

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('❌ Token exchange failed:', error);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, scope } = tokenData;

    console.log('✅ Access token received');

    // Test the token
    const testResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      throw new Error('Token validation failed');
    }

    const shopData = await testResponse.json();
    console.log('✅ Token validated, shop:', shopData.shop.name);

    // Save connection to database
    const { data, error } = await supabase
      .from('shopify_connections')
      .upsert({
        brand_id: brandId,
        shop_url: shop,
        access_token: access_token,
        scope: scope,
        is_active: true
      }, {
        onConflict: 'brand_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    // Update brand
    await supabase
      .from('brands')
      .update({
        shopify_store_url: shop,
        shopify_connected: true
      })
      .eq('id', brandId);

    console.log('✅ Connection saved to database');

    // Redirect back to app with success
    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
    const redirectUrl = `${appUrl}?shopify_connected=true`;
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    // Redirect back to app with error
    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
    const redirectUrl = `${appUrl}?shopify_error=${encodeURIComponent(error.message)}`;
    
    res.redirect(redirectUrl);
  }
});

// ============================================
// Shopify Webhook Handler
// ============================================
app.post('/api/shopify/webhook', async (req, res) => {
  try {
    const shop = req.headers['x-shopify-shop-domain'];
    const topic = req.headers['x-shopify-topic'];

    console.log('\n📥 Shopify Webhook received:', { shop, topic });
    console.log('📋 All headers:', req.headers);
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));

    // Get connection by shop domain
    console.log('🔍 Looking for shop:', shop);
    
    const { data: connections, error: connError } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('is_active', true);

    if (connError) {
      console.error('❌ Error fetching connections:', connError);
      return res.status(200).json({ success: true, message: 'Database error' });
    }

    console.log('📋 All active connections:', connections?.map(c => c.shop_url));

    // Find matching connection (exact or partial match)
    const connection = connections?.find(c => 
      c.shop_url === shop || 
      c.shop_url.includes(shop.split('.')[0]) || 
      shop.includes(c.shop_url.split('.')[0])
    );

    if (!connection) {
      console.log('⚠️  No active connection found for shop:', shop);
      return res.status(200).json({ success: true, message: 'Shop not connected' });
    }

    console.log('✅ Connection found:', connection.shop_url);
    console.log('🔑 Brand ID:', connection.brand_id);

    // Get brand separately
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', connection.brand_id)
      .single();

    if (brandError || !brand) {
      console.error('❌ Brand not found:', connection.brand_id);
      return res.status(200).json({ success: true, message: 'Brand not found' });
    }
    
    console.log('✅ Brand found:', brand.name);
    console.log('📱 Phone Number ID:', brand.phone_number_id);
    console.log('🔑 Has WhatsApp Token:', !!brand.whatsapp_token);

    // Handle different webhook topics
    if (topic === 'orders/create') {
      await handleOrderCreate(req.body, brand, connection);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Send Interactive Message with Buttons
// ============================================
async function sendInteractiveMessage(brand, phone, messageText, orderId) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: messageText
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: `confirm_${orderId}`,
                  title: '✅ تأكيد'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: `cancel_${orderId}`,
                  title: '❌ إلغاء'
                }
              }
            ]
          }
        }
      })
    }
  );
  
  return response.json();
}

// ============================================
// Send Text Message Helper
// ============================================
async function sendTextMessage(brand, phone, text) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text }
      })
    }
  );
  
  return response.json();
}

// Handle new order - Send confirmation message using Templates
async function handleOrderCreate(order, brand, connection) {
  console.log('📦 Processing new order:', order.id);

  try {
    // Get customer phone
    let phone = order.customer?.phone || order.shipping_address?.phone || order.billing_address?.phone;
    
    if (!phone) {
      console.log('⚠️  No phone number in order');
      return;
    }

    // Clean phone number
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '20' + phone.substring(1); // Egypt
    }

    console.log('📱 Customer phone:', phone);

    // Find or create contact
    console.log('🔍 Looking for contact with wa_id:', phone);
    
    const { data: existingContacts, error: contactFetchError } = await supabase
      .from('contacts')
      .select('id, name, created_at')
      .eq('brand_id', brand.id)
      .eq('wa_id', phone)
      .limit(1);

    if (contactFetchError) {
      console.error('❌ Error fetching contact:', contactFetchError);
      return;
    }

    let contact = existingContacts && existingContacts.length > 0 ? existingContacts[0] : null;
    let isNewCustomer = false;

    if (!contact) {
      const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || 'Customer';
      console.log('👤 Creating new contact:', customerName);
      
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          brand_id: brand.id,
          wa_id: phone,
          name: customerName,
          last_message_at: new Date().toISOString()
        })
        .select('id, name, created_at')
        .single();
      
      if (createError) {
        console.error('❌ Error creating contact:', createError);
        return;
      }
      
      contact = newContact;
      isNewCustomer = true;
      console.log('✅ Contact created (NEW CUSTOMER):', contact.id);
    } else {
      console.log('✅ Contact found (EXISTING CUSTOMER):', contact.id);
      isNewCustomer = false;
    }

    if (!contact || !contact.id) {
      console.error('❌ No contact ID available');
      return;
    }

    console.log('✅ Using Contact ID:', contact.id);
    console.log('🆕 Is New Customer:', isNewCustomer);

    // Build products list
    const products = order.line_items.map(item => {
      const detail = (item.variant_title && item.variant_title !== "Default Title") 
        ? ` - ${item.variant_title}` 
        : "";
      return `${item.title}${detail}`;
    }).join(', ');

    // Extract order details
    const orderNumber = order.order_number || order.id;
    const subtotal = order.current_subtotal_price || order.subtotal_price || "0";
    const shippingCost = order.total_shipping_price_set?.shop_money?.amount || order.shipping_lines?.[0]?.price || "0";
    const total = order.current_total_price || order.total_price || "0";
    
    // Customer details
    const firstName = order.shipping_address?.first_name || order.customer?.first_name || "";
    const lastName = order.shipping_address?.last_name || order.customer?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "عميلنا العزيز";
    const address = `${order.shipping_address?.address1 || ""}, ${order.shipping_address?.city || ""}`.trim();

    // Save order to database
    console.log('💾 Saving order to database...');

    const { data: savedOrder, error: orderError } = await supabase
      .from('shopify_orders')
      .insert({
        brand_id: brand.id,
        contact_id: contact.id,
        shopify_order_id: order.id.toString(),
        shopify_order_number: order.order_number?.toString(),
        order_status: order.financial_status,
        customer_phone: phone,
        customer_email: order.customer?.email,
        total_price: parseFloat(total),
        currency: order.currency || 'EGP',
        confirmation_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error saving order:', orderError);
      console.error('❌ Error details:', JSON.stringify(orderError, null, 2));
      return;
    }

    console.log('✅ Order saved to database:', savedOrder.id);

    // Send WhatsApp message
    if (!brand.whatsapp_token || brand.whatsapp_token === 'your_token_here') {
      console.log('⚠️  No WhatsApp token configured');
      return;
    }

    // NEW CUSTOMER → Use Template (save cost)
    // EXISTING CUSTOMER → Use regular text message (free within 24h window)
    if (isNewCustomer) {
      // Get template for new customers
      console.log('📋 NEW CUSTOMER - Fetching template...');
      
      const { data: template, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('template_type', 'new_customer')
        .eq('is_active', true)
        .single();

      if (template && template.meta_template_status === 'approved') {
        console.log(`✅ Using template:`, template.template_name);
        
        // Prepare template parameters
        const templateParams = [
          orderNumber.toString(),
          products,
          subtotal,
          shippingCost,
          total,
          fullName,
          address
        ];

        // Build template message payload
        const components = [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ];

        // Add buttons if template has them
        if (template.buttons && template.buttons.length > 0) {
          components.push({
            type: 'button',
            sub_type: 'quick_reply',
            index: 0,
            parameters: [{ type: 'payload', payload: 'confirm_order' }]
          });
          components.push({
            type: 'button',
            sub_type: 'quick_reply',
            index: 1,
            parameters: [{ type: 'payload', payload: 'cancel_order' }]
          });
        }

        messagePayload = {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: template.template_name,
            language: { code: template.language_code || 'ar' },
            components: components
          }
        };

        // For logging purposes
        messageText = template.body_text
          .replace('{{1}}', orderNumber)
          .replace('{{2}}', products)
          .replace('{{3}}', subtotal)
          .replace('{{4}}', shippingCost)
          .replace('{{5}}', total)
          .replace('{{6}}', fullName)
          .replace('{{7}}', address);

      } else {
        // Fallback to Interactive Message with buttons
        console.log('⚠️  No template found, using Interactive Message with buttons');
        
        messageText = `🌙 *أهلاً بك في ${brand.name}* ✨

شكراً لاختيارك لنا، طلبك وصلنا وبانتظار تأكيدك للبدء في تجهيزه فوراً.

🧾 *رقم الطلب:* #${orderNumber}

🧣 *القطع المختارة:*
${products}

ــــــــــــــــــــــــــــــــــــــــ
💰 *تفاصيل الفاتورة:*
🔸 المجموع الفرعي: ${subtotal} EGP
🚚 مصاريف الشحن: ${shippingCost} EGP
ــــــــــــــــــــــــــــــــــــــــ
💵 *الإجمالي النهائي: ${total} EGP*
ــــــــــــــــــــــــــــــــــــــــ

📍 *بيانات التوصيل:*
👤 المستلم: ${fullName}
🏠 العنوان: ${address}

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

نتمنى لكِ تجربة مميزة مع ${brand.name} 🌙`;
      }
    } else {
      // EXISTING CUSTOMER → Interactive Message with buttons (free within 24h window)
      console.log('💬 EXISTING CUSTOMER - Using Interactive Message with buttons (free within 24h)');
      
      // Get custom message from brand settings or use default
      let messageTemplate = brand.existing_customer_message || `🌙 *طلب جديد* ✨

شكراً لثقتك فينا! طلبك الجديد وصلنا 🎉

🧾 *رقم الطلب:* #{order_number}

🧣 *القطع المختارة:*
{products}

ــــــــــــــــــــــــــــــــــــــــ
💰 *تفاصيل الفاتورة:*
🔸 المجموع الفرعي: {subtotal} EGP
🚚 مصاريف الشحن: {shipping} EGP
ــــــــــــــــــــــــــــــــــــــــ
💵 *الإجمالي النهائي: {total} EGP*
ــــــــــــــــــــــــــــــــــــــــ

📍 *بيانات التوصيل:*
👤 المستلم: {customer_name}
🏠 العنوان: {address}

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

نتمنى لكِ تجربة مميزة مع {brand_name} 🌙`;

      // Replace variables in message
      messageText = messageTemplate
        .replace(/{customer_name}/g, fullName)
        .replace(/{order_number}/g, orderNumber)
        .replace(/{products}/g, products)
        .replace(/{subtotal}/g, subtotal)
        .replace(/{shipping}/g, shippingCost)
        .replace(/{total}/g, total)
        .replace(/{address}/g, address)
        .replace(/{brand_name}/g, brand.name);

      console.log('✅ Message variables replaced');
    }

    console.log('📤 Sending WhatsApp message...');
    console.log('📋 Message type: Interactive with buttons');

    // Send interactive message with buttons
    const whatsappData = await sendInteractiveMessage(
      brand,
      phone,
      messageText,
      savedOrder.id
    );

    if (whatsappData.error) {
      console.error('❌ WhatsApp API error:', whatsappData);
      return;
    }

    const wa_message_id = whatsappData.messages?.[0]?.id;
    console.log('✅ WhatsApp message sent with buttons:', wa_message_id);

    // Save message to database
    await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        brand_id: brand.id,
        order_id: savedOrder.id,
        direction: 'outbound',
        message_type: 'interactive',
        body: messageText,
        wa_message_id: wa_message_id,
        status: 'sent',
        created_at: new Date().toISOString()
      });

    console.log('✅ Order processing completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error handling order create:', error);
  }
}

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Shopify OAuth Install: http://localhost:${PORT}/api/shopify/oauth/install`);
  console.log(`📍 Shopify OAuth Callback: http://localhost:${PORT}/api/shopify/oauth/callback`);
  console.log(`📍 Shopify Webhook: http://localhost:${PORT}/api/shopify/webhook\n`);
});

// ============================================
// Order Confirmation Handler
// ============================================
async function handleOrderConfirmation(orderId, contact, brand) {
  console.log('✅ Processing order confirmation for order:', orderId);
  
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    // Update order status
    await supabase
      .from('shopify_orders')
      .update({
        confirmation_status: 'confirmed',
        customer_response: 'confirmed',
        response_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    console.log('✅ Order status updated to confirmed');
    
    // Get confirmation message
    let messageText = brand.confirmation_message || `✅ *تم تأكيد طلبك بنجاح!*

شكراً {customer_name}! 🎉

🧾 رقم الطلب: #{order_number}

نحن الآن نجهز طلبك بعناية، وسيتم التواصل معك قريباً لترتيب موعد التوصيل 🚚

شكراً لثقتك في {brand_name} 💙`;
    
    // Replace variables
    messageText = messageText
      .replace(/{customer_name}/g, contact.name)
      .replace(/{order_number}/g, order.shopify_order_number)
      .replace(/{brand_name}/g, brand.name);
    
    // Send confirmation message
    await sendTextMessage(brand, contact.wa_id, messageText);
    
    console.log('✅ Confirmation message sent');
    
  } catch (error) {
    console.error('❌ Error in handleOrderConfirmation:', error);
  }
}

// ============================================
// Order Cancellation Handler
// ============================================
async function handleOrderCancellation(orderId, contact, brand) {
  console.log('❌ Processing order cancellation for order:', orderId);
  
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('❌ Order not found:', orderId);
      return;
    }
    
    // Update order status
    await supabase
      .from('shopify_orders')
      .update({
        confirmation_status: 'cancelled',
        customer_response: 'cancelled',
        response_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    console.log('✅ Order status updated to cancelled');
    
    // Get cancellation message
    let messageText = brand.cancellation_message || `❌ *تم إلغاء طلبك*

{customer_name}، تم إلغاء طلب رقم #{order_number} بنجاح.

نأسف لعدم إتمام الطلب. يمكنك الطلب مرة أخرى في أي وقت.

نتمنى خدمتك قريباً 💙`;
    
    // Replace variables
    messageText = messageText
      .replace(/{customer_name}/g, contact.name)
      .replace(/{order_number}/g, order.shopify_order_number)
      .replace(/{brand_name}/g, brand.name);
    
    // Send cancellation message
    await sendTextMessage(brand, contact.wa_id, messageText);
    
    console.log('✅ Cancellation message sent');
    
  } catch (error) {
    console.error('❌ Error in handleOrderCancellation:', error);
  }
}
