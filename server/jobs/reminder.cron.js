/**
 * Reminder Cron Job
 * Sends reminder messages for pending orders after 1 hour
 */

import { getSupabaseClient } from '../db/client.js';
import { logger } from '../utils/logger.js';
import WhatsAppService from '../services/whatsapp.service.js';

const REMINDER_DELAY_HOURS = 1;
const CHECK_INTERVAL_MINUTES = 5;

logger.info('Reminder Cron Job Started', {
  reminderDelay: `${REMINDER_DELAY_HOURS} hour(s)`,
  checkInterval: `${CHECK_INTERVAL_MINUTES} minute(s)`,
});

/**
 * Send reminders for pending orders
 */
async function sendReminders() {
  const supabase = getSupabaseClient();

  logger.info('Checking for orders needing reminders');

  try {
    // Get orders older than 1 hour with no response
    const oneHourAgo = new Date(Date.now() - REMINDER_DELAY_HOURS * 60 * 60 * 1000).toISOString();

    const { data: orders, error } = await supabase
      .from('shopify_orders')
      .select(
        `
        *,
        contacts (id, name, wa_id),
        brands (id, name, phone_number_id, whatsapp_token, reminder_message)
      `
      )
      .eq('confirmation_status', 'pending')
      .eq('reminder_sent', false)
      .lt('created_at', oneHourAgo);

    if (error) {
      logger.error('Error fetching orders', {
        error: error.message,
      });
      return;
    }

    logger.info('Found orders needing reminders', {
      count: orders?.length || 0,
    });

    if (!orders || orders.length === 0) {
      return;
    }

    // Process each order
    for (const order of orders) {
      try {
        await sendReminderForOrder(supabase, order);
      } catch (error) {
        logger.error('Error processing order', {
          orderId: order.id,
          error: error.message,
        });
      }
    }

    logger.info('Reminder check completed');
  } catch (error) {
    logger.error('Error in sendReminders', {
      error: error.message,
    });
  }
}

/**
 * Send reminder for a single order
 */
async function sendReminderForOrder(supabase, order) {
  logger.info('Sending reminder', {
    orderId: order.id,
    orderNumber: order.shopify_order_number,
  });

  // Get reminder message
  let messageText =
    order.brands.reminder_message ||
    `👋 مرحباً {customer_name}

لسه مستنيين ردك على طلب رقم #{order_number} 🛍️

عشان نبدأ نجهز طلبك، محتاجين تأكيدك.

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

رد بـ "تأكيد" أو "إلغاء"`;

  // Replace variables
  messageText = messageText
    .replace(/{customer_name}/g, order.contacts.name)
    .replace(/{order_number}/g, order.shopify_order_number)
    .replace(/{brand_name}/g, order.brands.name);

  // Send reminder
  try {
    await WhatsAppService.sendTextMessage(
      order.brands.phone_number_id,
      order.brands.whatsapp_token,
      order.contacts.wa_id,
      messageText
    );

    // Mark reminder as sent
    await supabase
      .from('shopify_orders')
      .update({
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    logger.info('Reminder sent successfully', {
      orderId: order.id,
      orderNumber: order.shopify_order_number,
    });
  } catch (error) {
    logger.error('Failed to send reminder', {
      orderId: order.id,
      error: error.message,
    });
  }
}

// Run every 5 minutes
setInterval(sendReminders, CHECK_INTERVAL_MINUTES * 60 * 1000);

// Run immediately on start
sendReminders();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down cron job');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down cron job');
  process.exit(0);
});
