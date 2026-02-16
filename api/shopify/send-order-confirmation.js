// Vercel Serverless Function - Send Order Confirmation with Buttons
import { createClient } from '@supabase/supabase-js';
export const config = { runtime: "nodejs" };

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      phone_number,
      order_id,
      order_number,
      customer_name,
      total,
      brand_id,
      items = []
    } = req.body;

    // Validation
    if (!phone_number || !order_id || !brand_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phone_number, order_id, brand_id'
      });
    }

    // Clean phone number
    let wa_id = phone_number.replace(/[^\d]/g, '');
    if (wa_id.startsWith('0')) {
      wa_id = '2' + wa_id; // Egypt country code
    }

    console.log('📦 Processing order confirmation:', {
      order_id,
      order_number,
      phone: wa_id,
      brand_id
    });

    // 1. Get brand info with template settings
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, name, phone_number_id, whatsapp_token, template_name, template_language, use_template')
      .eq('id', brand_id)
      .single();

    if (brandError || !brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    if (!brand.whatsapp_token || brand.whatsapp_token === 'your_token_here') {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp token not configured for this brand'
      });
    }

    // 2. Create/get contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        brand_id: brand.id,
        wa_id: wa_id,
        name: customer_name || wa_id,
        last_message_at: new Date().toISOString()
      }, {
        onConflict: 'brand_id,wa_id'
      })
      .select()
      .single();

    if (contactError) {
      console.error('Contact error:', contactError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create contact'
      });
    }

    // 3. Build message text
    const itemsList = items.length > 0
      ? items.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')
      : '';

    const messageText = `مرحباً ${customer_name || 'عزيزي العميل'} 👋

تم استلام طلبك بنجاح! 🎉

📦 رقم الطلب: ${order_number || order_id}
💰 الإجمالي: ${total || 'سيتم التأكيد'}

${itemsList ? `📋 المنتجات:\n${itemsList}\n` : ''}
برجاء تأكيد الطلب للمتابعة في عملية الشحن.`;

    // 4. Send WhatsApp message (Template or Interactive)
    let whatsappPayload;
    let messageType;

    if (brand.use_template && brand.template_name) {
      // Use Template Message
      console.log('📋 Using template:', brand.template_name);
      
      messageType = 'template';
      whatsappPayload = {
        messaging_product: 'whatsapp',
        to: wa_id,
        type: 'template',
        template: {
          name: brand.template_name,
          language: {
            code: brand.template_language || 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: customer_name || 'عزيزي العميل' },
                { type: 'text', text: order_number || order_id },
                { type: 'text', text: itemsList || 'المنتجات المطلوبة' },
                { type: 'text', text: total || 'سيتم التأكيد' }
              ]
            },
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: 0,
              parameters: [
                { type: 'payload', payload: `confirm_${order_id}` }
              ]
            },
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: 1,
              parameters: [
                { type: 'payload', payload: `cancel_${order_id}` }
              ]
            }
          ]
        }
      };
    } else {
      // Use Interactive Message (old way)
      console.log('💬 Using interactive message');
      
      messageType = 'interactive';
      whatsappPayload = {
        messaging_product: 'whatsapp',
        to: wa_id,
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
                  id: `confirm_${order_id}`,
                  title: 'تأكيد الطلب ✅'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: `cancel_${order_id}`,
                  title: 'إلغاء الطلب ❌'
                }
              }
            ]
          }
        }
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
      console.error('WhatsApp API error:', whatsappData);
      return res.status(500).json({
        success: false,
        error: whatsappData.error?.message || 'Failed to send WhatsApp message'
      });
    }

    const wa_message_id = whatsappData.messages?.[0]?.id;
    console.log('✅ WhatsApp message sent:', wa_message_id);

    // 5. Save message to database
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contact.id,
        brand_id: brand.id,
        direction: 'outbound',
        message_type: messageType,
        body: brand.use_template ? `Template: ${brand.template_name}` : messageText,
        status: 'sent',
        wa_message_id: wa_message_id
      })
      .select()
      .single();

    if (messageError) {
      console.error('Message save error:', messageError);
    }

    // 6. Track order in database
    const { data: orderData, error: orderError } = await supabase
      .from('shopify_orders')
      .insert({
        brand_id: brand.id,
        contact_id: contact.id,
        shopify_order_id: order_id,
        shopify_order_number: order_number,
        order_status: 'pending_confirmation',
        customer_phone: wa_id,
        total_price: parseFloat(total?.replace(/[^\d.]/g, '') || 0),
        whatsapp_message_id: messageData?.id,
        confirmation_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order tracking error:', orderError);
    }

    console.log('✅ Order confirmation sent successfully');

    return res.json({
      success: true,
      message_id: wa_message_id,
      contact_id: contact.id,
      order_tracked: !!orderData,
      message: 'Order confirmation sent with interactive buttons'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
