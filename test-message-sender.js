
// Test Message Sender - Use after token update
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rmpgofswkpjxionzythf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcGdvZnN3a3BqeGlvbnp5dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Nzk0MzIsImV4cCI6MjA4NjE1NTQzMn0.njRxN-NKEUL1_TVnCKbQUgZHIRuUrzByJmKg1ErWafM'
);

async function sendTestMessage() {
    console.log('📤 Sending test message...');
    
    const { data: brand } = await supabase
        .from('brands')
        .select('*')
        .eq('name', '4 Pixels')
        .single();
        
    if (!brand || !brand.whatsapp_token || brand.whatsapp_token.includes('REPLACE_ME')) {
        console.log('❌ Token not updated yet. Run quick-token-update.js first');
        return;
    }
    
    const message = {
        messaging_product: 'whatsapp',
        to: '201234567890', // Replace with your test number
        type: 'text',
        text: {
            body: `✅ نظام WhatsApp CRM يعمل بشكل مثالي!

🏷️ العلامة التجارية: ${brand.name}
⏰ الوقت: ${new Date().toLocaleString('ar-EG')}
🚀 الحالة: جاهز للاستخدام

تم إصلاح مشكلة إرسال الرسائل بنجاح! 🎉`
        }
    };
    
    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${brand.phone_number_id}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${brand.whatsapp_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            }
        );
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ MESSAGE SENT SUCCESSFULLY!');
            console.log('✅ Message ID:', result.messages?.[0]?.id);
        } else {
            console.error('❌ Send failed:', result);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

sendTestMessage();
