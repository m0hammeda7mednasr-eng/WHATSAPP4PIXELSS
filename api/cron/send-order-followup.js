// Cron Job: Send reminder for pending orders (no response after 1 hour)
// Run every 15 minutes to check for orders that need reminder
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Verify cron secret (optional security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🔄 Running order reminder cron job...');

    // Get orders created 1 hour ago that are still pending (no response)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: orders, error } = await supabase
      .from('shopify_orders')
      .select('*, brands(*), contacts(*)')
      .eq('confirmation_status', 'pending')
      .is('reminder_sent_at', null)
      .lt('created_at', oneHourAgo);

    if (error) throw error;

    if (!orders || orders.length === 0) {
      console.log('✅ No orders need reminder');
      return res.status(200).json({ success: true, count: 0 });
    }

    console.log(`📦 Found ${orders.length} orders needing reminder`);

    let successCount = 0;
    let failCount = 0;

    for (const order of orders) {
      try {
        const brand = order.brands;
        const contact = order.contacts;

        if (!brand.whatsapp_token || !contact.wa_id) {
          console.log(`⚠️  Skipping order ${order.id} - missing token or phone`);
          failCount++;
          continue;
        }

        // Send reminder message with buttons again
        const customTemplate = brand.reminder_message || `مرحباً {customer_name} 👋

لسه مستنيين ردك على طلب رقم #{order_number} 🛍️

عشان نبدأ نجهز طلبك، محتاجين تأكيدك.

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*`;

        // Replace variables
        const reminderMessage = customTemplate
          .replace(/{customer_name}/g, contact.name || 'عزيزي العميل')
          .replace(/#{order_number}/g, order.shopify_order_number || order.shopify_order_id)
          .replace(/{brand_name}/g, brand.name)
          .replace(/{brand_emoji}/g, brand.brand_emoji || '💙');

        // Send interactive message with buttons
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
              to: contact.wa_id,
              type: 'interactive',
              interactive: {
                type: 'button',
                body: {
                  text: reminderMessage
                },
                action: {
                  buttons: [
                    {
                      type: 'reply',
                      reply: {
                        id: `confirm_${order.id}`,
                        title: '✅ تأكيد'
                      }
                    },
                    {
                      type: 'reply',
                      reply: {
                        id: `cancel_${order.id}`,
                        title: '❌ إلغاء'
                      }
                    }
                  ]
                }
              }
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`❌ Failed to send reminder for order ${order.id}:`, error);
          failCount++;
          continue;
        }

        const data = await response.json();

        // Save message to database
        await supabase
          .from('messages')
          .insert({
            contact_id: contact.id,
            brand_id: brand.id,
            order_id: order.id,
            direction: 'outbound',
            message_type: 'interactive',
            body: reminderMessage,
            wa_message_id: data.messages[0].id,
            status: 'sent'
          });

        // Mark reminder as sent
        await supabase
          .from('shopify_orders')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', order.id);

        console.log(`✅ Reminder sent for order ${order.shopify_order_number}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error);
        failCount++;
      }
    }

    console.log(`✅ Cron job completed: ${successCount} sent, ${failCount} failed`);

    return res.status(200).json({
      success: true,
      total: orders.length,
      sent: successCount,
      failed: failCount
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
