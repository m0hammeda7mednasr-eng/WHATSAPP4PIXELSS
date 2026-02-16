// Send Abandoned Cart Reminder
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { checkoutId, shopUrl, customerPhone, customerName, cartItems, totalPrice, checkoutUrl } = req.body;

    if (!checkoutId || !shopUrl || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get brand by shop URL
    const { data: connection } = await supabase
      .from('shopify_connections')
      .select('*, brands(*)')
      .eq('shop_url', shopUrl)
      .eq('is_active', true)
      .single();

    if (!connection) {
      return res.status(404).json({ error: 'Shop not connected' });
    }

    const brand = connection.brands;

    // Clean phone number
    let phone = customerPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '20' + phone.substring(1);
    }

    // Build cart items list
    const items = cartItems.map(item => 
      `• ${item.title} (${item.quantity}x) - ${item.price} ${item.currency}`
    ).join('\n');

    const message = `👋 مرحباً ${customerName || 'عزيزي العميل'}!

لاحظنا إنك سبت منتجات في السلة 🛒

*المنتجات:*
${items}

💰 *الإجمالي:* ${totalPrice}

اكمل طلبك دلوقتي واحصل على خصم 10%! 🎁

اضغط الزر للإكمال 👇`;

    const url = `https://graph.facebook.com/v21.0/${brand.phone_number_id}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `complete_checkout_${checkoutId}`,
                title: '🛒 إكمال الطلب'
              }
            }
          ]
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brand.whatsapp_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send reminder:', error);
      return res.status(500).json({ error: 'Failed to send message', details: error });
    }

    const data = await response.json();

    // Log the reminder
    await supabase
      .from('shopify_webhook_logs')
      .insert({
        brand_id: brand.id,
        webhook_type: 'abandoned_cart_reminder',
        payload: { checkoutId, phone, messageId: data.messages[0].id },
        processed: true
      });

    res.status(200).json({ 
      success: true, 
      messageId: data.messages[0].id,
      message: 'Reminder sent successfully'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}
