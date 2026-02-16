// Fix Message Sending Issue - Local Server
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixMessageSending() {
    console.log('🔧 Fixing Message Sending Issue...');
    console.log('==================================');
    
    try {
        // Step 1: Check Supabase connection
        console.log('\n📋 Step 1: Checking Database Connection');
        console.log('======================================');
        
        const { data: brands, error: brandsError } = await supabase
            .from('brands')
            .select('*')
            .limit(1);
            
        if (brandsError) {
            console.error('❌ Database connection failed:', brandsError);
            return;
        }
        
        console.log('✅ Database connected successfully');
        console.log('✅ Found brands:', brands?.length || 0);
        
        // Step 2: Check if we have a brand with WhatsApp token
        console.log('\n📋 Step 2: Checking WhatsApp Configuration');
        console.log('==========================================');
        
        const { data: activeBrands, error: activeError } = await supabase
            .from('brands')
            .select('*')
            .not('whatsapp_token', 'is', null)
            .not('phone_number_id', 'is', null);
            
        if (activeError) {
            console.error('❌ Error checking active brands:', activeError);
            return;
        }
        
        if (!activeBrands || activeBrands.length === 0) {
            console.log('⚠️  No active WhatsApp brands found');
            console.log('');
            console.log('🔧 TO FIX THIS:');
            console.log('===============');
            console.log('1. Go to your dashboard');
            console.log('2. Add a brand with WhatsApp token');
            console.log('3. Make sure phone_number_id is set');
            console.log('4. Test again');
            return;
        }
        
        console.log('✅ Found active WhatsApp brands:', activeBrands.length);
        
        // Step 3: Test sending a message
        console.log('\n📋 Step 3: Testing Message Sending');
        console.log('==================================');
        
        const testBrand = activeBrands[0];
        console.log('🏷️  Using brand:', testBrand.name);
        console.log('📱 Phone Number ID:', testBrand.phone_number_id);
        console.log('🔑 Token available:', testBrand.whatsapp_token ? 'Yes' : 'No');
        
        // Test message
        const testMessage = {
            messaging_product: 'whatsapp',
            to: '201234567890', // Test number
            type: 'text',
            text: {
                body: `🧪 Test message from ${testBrand.name}\n\nTime: ${new Date().toLocaleString('ar-EG')}\n\nThis is a test to verify message sending is working! ✅`
            }
        };
        
        console.log('📤 Sending test message...');
        
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${testBrand.phone_number_id}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${testBrand.whatsapp_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testMessage)
            }
        );
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ MESSAGE SENT SUCCESSFULLY!');
            console.log('✅ Message ID:', result.messages?.[0]?.id);
            console.log('✅ WhatsApp API is working');
            
            // Save test message to database
            const { data: contact } = await supabase
                .from('contacts')
                .select('id')
                .eq('brand_id', testBrand.id)
                .eq('wa_id', '201234567890')
                .single();
                
            if (contact) {
                await supabase
                    .from('messages')
                    .insert({
                        contact_id: contact.id,
                        brand_id: testBrand.id,
                        direction: 'outbound',
                        message_type: 'text',
                        body: testMessage.text.body,
                        wa_message_id: result.messages?.[0]?.id,
                        status: 'sent'
                    });
                console.log('✅ Message saved to database');
            }
            
        } else {
            console.error('❌ MESSAGE SENDING FAILED!');
            console.error('❌ Status:', response.status);
            console.error('❌ Error:', result);
            
            if (result.error?.code === 190) {
                console.log('');
                console.log('🔧 TOKEN EXPIRED - FIX NEEDED:');
                console.log('==============================');
                console.log('1. Go to Meta Business Manager');
                console.log('2. Generate new permanent token');
                console.log('3. Update in database');
                console.log('4. Test again');
            }
        }
        
        // Step 4: Check recent messages
        console.log('\n📋 Step 4: Checking Recent Messages');
        console.log('===================================');
        
        const { data: recentMessages } = await supabase
            .from('messages')
            .select(`
                *,
                contacts(name, wa_id),
                brands(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (recentMessages && recentMessages.length > 0) {
            console.log('✅ Recent messages found:');
            recentMessages.forEach((msg, index) => {
                console.log(`${index + 1}. ${msg.direction} - ${msg.message_type} - ${msg.status}`);
                console.log(`   From/To: ${msg.contacts?.name || msg.contacts?.wa_id}`);
                console.log(`   Brand: ${msg.brands?.name}`);
                console.log(`   Time: ${new Date(msg.created_at).toLocaleString('ar-EG')}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No recent messages found');
        }
        
        console.log('\n🎉 DIAGNOSIS COMPLETE!');
        console.log('=====================');
        
        if (response.ok) {
            console.log('✅ Message sending is WORKING');
            console.log('✅ Your local server can send messages');
            console.log('✅ WhatsApp API is connected');
            console.log('');
            console.log('🔧 If messages still not working:');
            console.log('1. Check webhook URL in Meta');
            console.log('2. Make sure webhook is receiving messages');
            console.log('3. Check brand configuration');
        } else {
            console.log('❌ Message sending is NOT working');
            console.log('❌ Fix the token/configuration first');
        }
        
    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
        console.log('');
        console.log('🔧 COMMON FIXES:');
        console.log('================');
        console.log('1. Check .env file has correct values');
        console.log('2. Make sure Supabase is accessible');
        console.log('3. Verify WhatsApp token is valid');
        console.log('4. Check brand configuration in database');
    }
}

// Run the fix
fixMessageSending();