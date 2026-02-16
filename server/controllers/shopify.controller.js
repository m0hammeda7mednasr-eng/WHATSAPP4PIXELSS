/**
 * Shopify Controller
 * Handles Shopify OAuth and webhooks
 */

import { getSupabaseClient } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { validateAndFormatPhone } from '../utils/validation.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import ShopifyService from '../services/shopify.service.js';
import WhatsAppService from '../services/whatsapp.service.js';

/**
 * Start OAuth flow
 */
export async function startOAuth(req, res) {
  const { shop, brand_id, client_id, client_secret } = req.validated.query;

  logger.info('Starting Shopify OAuth', {
    correlationId: req.correlationId,
    shop,
    brandId: brand_id,
  });

  const scopes = [
    'read_orders',
    'write_orders',
    'read_products',
    'read_customers',
    'write_fulfillments',
  ].join(',');

  // Encode state with credentials
  const stateData = {
    brandId: brand_id,
    clientId: client_id,
    clientSecret: client_secret,
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

  const redirectUri = `${env.urls.api}/api/shopify/oauth/callback`;

  const authUrl =
    `https://${shop}/admin/oauth/authorize?` +
    `client_id=${client_id}&` +
    `scope=${scopes}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}`;

  logger.info('Redirecting to Shopify OAuth', {
    correlationId: req.correlationId,
    redirectUri,
  });

  res.redirect(authUrl);
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(req, res) {
  const supabase = getSupabaseClient();
  const { code, state, shop } = req.validated.query;

  logger.info('OAuth callback received', {
    correlationId: req.correlationId,
    shop,
  });

  try {
    // Decode state
    const decodedState = Buffer.from(state, 'base64').toString('utf-8');
    const stateData = JSON.parse(decodedState);
    const { brandId, clientId, clientSecret } = stateData;

    // Get brand
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (brandError || !brand) {
      throw new NotFoundError('Brand');
    }

    // Exchange code for access token
    const tokenData = await ShopifyService.exchangeCodeForToken(
      shop,
      clientId,
      clientSecret,
      code
    );

    const { access_token, scope } = tokenData;

    // Validate token
    await ShopifyService.validateToken(shop, access_token);

    // Save connection to database
    await supabase
      .from('shopify_connections')
      .upsert(
        {
          brand_id: brandId,
          shop_url: shop,
          access_token: access_token,
          scope: scope,
          is_active: true,
        },
        {
          onConflict: 'brand_id',
        }
      );

    // Update brand
    await supabase
      .from('brands')
      .update({
        shopify_store_url: shop,
        shopify_connected: true,
      })
      .eq('id', brandId);

    logger.info('Shopify connection saved', {
      correlationId: req.correlationId,
      shop,
      brandId,
    });

    // Redirect back to app with success
    const redirectUrl = `${env.urls.app}?shopify_connected=true`;
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('OAuth callback error', {
      correlationId: req.correlationId,
      error: error.message,
    });

    const redirectUrl = `${env.urls.app}?shopify_error=${encodeURIComponent(error.message)}`;
    res.redirect(redirectUrl);
  }
}

/**
 * Handle Shopify webhook
 */
export async function handleWebhook(req, res) {
  const supabase = getSupabaseClient();
  const shop = req.headers['x-shopify-shop-domain'];
  const topic = req.headers['x-shopify-topic'];
  const hmac = req.headers['x-shopify-hmac-sha256'];

  logger.info('Shopify webhook received', {
    correlationId: req.correlationId,
    shop,
    topic,
  });

  // Verify webhook signature
  if (env.webhook.shopifySecret) {
    const isValid = ShopifyService.verifyWebhook(req.body, hmac, env.webhook.shopifySecret);
    if (!isValid) {
      logger.error('Webhook verification failed', {
        correlationId: req.correlationId,
      });
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  // Get connection by shop domain
  const { data: connections, error: connError } = await supabase
    .from('shopify_connections')
    .select('*')
    .eq('is_active', true);

  if (connError) {
    logger.error('Error fetching connections', {
      correlationId: req.correlationId,
      error: connError.message,
    });
    return res.status(200).json({ success: true });
  }

  // Find matching connection
  const connection = connections?.find(
    (c) =>
      c.shop_url === shop ||
      c.shop_url.includes(shop.split('.')[0]) ||
      shop.includes(c.shop_url.split('.')[0])
  );

  if (!connection) {
    logger.warn('No active connection found', {
      correlationId: req.correlationId,
      shop,
    });
    return res.status(200).json({ success: true });
  }

  // Get brand
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('id', connection.brand_id)
    .single();

  if (brandError || !brand) {
    logger.error('Brand not found', {
      correlationId: req.correlationId,
      brandId: connection.brand_id,
    });
    return res.status(200).json({ success: true });
  }

  // Handle different webhook topics
  if (topic === 'orders/create') {
    await handleOrderCreate(req, req.body, brand, connection);
  }

  res.status(200).json({ success: true });
}

/**
 * Handle new order creation
 */
async function handleOrderCreate(req, order, brand, connection) {
  const supabase = getSupabaseClient();

  logger.info('Processing new order', {
    correlationId: req.correlationId,
    orderId: order.id,
  });

  try {
    // Get customer phone
    let phone = order.customer?.phone || order.shipping_address?.phone || order.billing_address?.phone;

    if (!phone) {
      logger.warn('No phone number in order', {
        correlationId: req.correlationId,
        orderId: order.id,
      });
      return;
    }

    // Format phone number
    phone = validateAndFormatPhone(phone);

    // Find or create contact
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('id, name, created_at')
      .eq('brand_id', brand.id)
      .eq('wa_id', phone)
      .limit(1);

    let contact = existingContacts?.[0];
    let isNewCustomer = false;

    if (!contact) {
      const customerName =
        `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() ||
        'Customer';

      const { data: newContact } = await supabase
        .from('contacts')
        .insert({
          brand_id: brand.id,
          wa_id: phone,
          name: customerName,
          last_message_at: new Date().toISOString(),
        })
        .select('id, name, created_at')
        .single();

      contact = newContact;
      isNewCustomer = true;
    }

    if (!contact) {
      logger.error('Failed to create/find contact', {
        correlationId: req.correlationId,
      });
      return;
    }

    // Build products list
    const products = order.line_items
      .map((item) => {
        const detail =
          item.variant_title && item.variant_title !== 'Default Title'
            ? ` - ${item.variant_title}`
            : '';
        return `${item.title}${detail}`;
      })
      .join(', ');

    // Extract order details
    const orderNumber = order.order_number || order.id;
    const subtotal = order.current_subtotal_price || order.subtotal_price || '0';
    const shippingCost =
      order.total_shipping_price_set?.shop_money?.amount || order.shipping_lines?.[0]?.price || '0';
    const total = order.current_total_price || order.total_price || '0';

    const firstName = order.shipping_address?.first_name || order.customer?.first_name || '';
    const lastName = order.shipping_address?.last_name || order.customer?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'عميلنا العزيز';
    const address = `${order.shipping_address?.address1 || ''}, ${
      order.shipping_address?.city || ''
    }`.trim();

    // Save order to database
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
        confirmation_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      logger.error('Failed to save order', {
        correlationId: req.correlationId,
        error: orderError.message,
      });
      return;
    }

    // Send WhatsApp message
    if (!brand.whatsapp_token || brand.whatsapp_token === 'your_token_here') {
      logger.warn('No WhatsApp token configured', {
        correlationId: req.correlationId,
      });
      return;
    }

    // Build message
    let messageText = isNewCustomer
      ? `🌙 *أهلاً بك في ${brand.name}* ✨

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

نتمنى لكِ تجربة مميزة مع ${brand.name} 🌙`
      : (brand.existing_customer_message || `🌙 *طلب جديد* ✨

شكراً لثقتك فينا! طلبك الجديد وصلنا 🎉

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

نتمنى لكِ تجربة مميزة مع ${brand.name} 🌙`)
          .replace(/{customer_name}/g, fullName)
          .replace(/{order_number}/g, orderNumber)
          .replace(/{products}/g, products)
          .replace(/{subtotal}/g, subtotal)
          .replace(/{shipping}/g, shippingCost)
          .replace(/{total}/g, total)
          .replace(/{address}/g, address)
          .replace(/{brand_name}/g, brand.name);

    // Send interactive message with buttons
    const whatsappData = await WhatsAppService.sendInteractiveMessage(
      brand.phone_number_id,
      brand.whatsapp_token,
      phone,
      messageText,
      [
        { id: `confirm_${savedOrder.id}`, title: '✅ تأكيد' },
        { id: `cancel_${savedOrder.id}`, title: '❌ إلغاء' },
      ]
    );

    const wa_message_id = whatsappData.messages?.[0]?.id;

    // Save message to database
    await supabase.from('messages').insert({
      contact_id: contact.id,
      brand_id: brand.id,
      order_id: savedOrder.id,
      direction: 'outbound',
      message_type: 'interactive',
      body: messageText,
      wa_message_id: wa_message_id,
      status: 'sent',
      created_at: new Date().toISOString(),
    });

    logger.info('Order processed successfully', {
      correlationId: req.correlationId,
      orderId: savedOrder.id,
    });
  } catch (error) {
    logger.error('Error handling order create', {
      correlationId: req.correlationId,
      error: error.message,
    });
  }
}
