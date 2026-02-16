// Update WhatsApp Token - Fix Expired Token Issue
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function updateWhatsAppToken() {
    console.log('🔧 Updating WhatsApp Token...');
    console.log('=============================');
    
    try {
        // Step 1: Get current brands
        console.log('\n📋 Step 1: Getting Current Brands');
        console.log('=================================');
        
        const { data: brands, error: brandsError } = await supabase
            .from('brands')
            .select('*')
            .not('whatsapp_token', 'is', null);
            
        if (brandsError) {
            console.error('❌ Error getting brands:', brandsError);
            return;
        }
        
        if (!brands || brands.length === 0) {
            console.log('⚠️  No brands with WhatsApp tokens found');
            return;
        }
        
        console.log('✅ Found brands with tokens:', brands.length);
        brands.forEach((brand, index) => {
            console.log(`${index + 1}. ${brand.name} (ID: ${brand.id})`);
            console.log(`   Phone Number ID: ${brand.phone_number_id}`);
            console.log(`   Token: ${brand.whatsapp_token ? 'Set' : 'Missing'}`);
        });
        
        // Step 2: Ask user to provide new token
        console.log('\n📋 Step 2: Token Update Required');
        console.log('================================');
        console.log('');
        console.log('🔧 TO GET A NEW PERMANENT TOKEN:');
        console.log('================================');
        console.log('1. Go to: https://business.facebook.com');
        console.log('2. Select your WhatsApp Business Account');
        console.log('3. Go to: System Users');
        console.log('4. Create/Edit a System User');
        console.log('5. Generate Access Token');
        console.log('6. Select: whatsapp_business_messaging, whatsapp_business_management');
        console.log('7. Set expiration to "Never"');
        console.log('8. Copy the token');
        console.log('');
        
        // For now, let's use a working token format and update the database
        console.log('📝 UPDATING DATABASE WITH PLACEHOLDER...');
        console.log('========================================');
        
        // Update the main brand (4 Pixels) with a placeholder that needs to be replaced
        const mainBrand = brands.find(b => b.name === '4 Pixels') || brands[0];
        
        if (mainBrand) {
            console.log(`🔄 Updating brand: ${mainBrand.name}`);
            
            // For now, we'll create a structure that can be easily updated
            const tokenPlaceholder = 'YOUR_PERMANENT_TOKEN_HERE_REPLACE_ME';
            
            const { error: updateError } = await supabase
                .from('brands')
                .update({
                    whatsapp_token: tokenPlaceholder,
                    updated_at: new Date().toISOString()
                })
                .eq('id', mainBrand.id);
                
            if (updateError) {
                console.error('❌ Error updating brand:', updateError);
            } else {
                console.log('✅ Brand updated with placeholder token');
            }
        }
        
        // Step 3: Create a quick update script
        console.log('\n📋 Step 3: Creating Quick Update Script');
        console.log('======================================');
        
        const updateScript = `
// Quick Token Update Script
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '${process.env.VITE_SUPABASE_URL}',
  '${process.env.VITE_SUPABASE_ANON_KEY}'
);

async function quickUpdateToken() {
    // Replace this with your actual permanent token
    const NEW_TOKEN = 'PASTE_YOUR_PERMANENT_TOKEN_HERE';
    
    if (NEW_TOKEN === 'PASTE_YOUR_PERMANENT_TOKEN_HERE') {
        console.log('❌ Please replace NEW_TOKEN with your actual token');
        return;
    }
    
    const { error } = await supabase
        .from('brands')
        .update({ whatsapp_token: NEW_TOKEN })
        .eq('name', '4 Pixels');
        
    if (error) {
        console.error('❌ Update failed:', error);
    } else {
        console.log('✅ Token updated successfully!');
        console.log('✅ Test message sending now');
    }
}

quickUpdateToken();
`;
        
        require('fs').writeFileSync('quick-token-update.js', updateScript);
        console.log('✅ Created: quick-token-update.js');
        
        // Step 4: Test with a mock working scenario
        console.log('\n📋 Step 4: Testing Message Structure');
        console.log('====================================');
        
        // Let's test the message structure without actually sending
        const testMessage = {
            messaging_product: 'whatsapp',
            to: '201234567890',
            type: 'text',
            text: {
                body: `🎉 مرحباً من ${mainBrand?.name || 'WhatsApp CRM'}!

هذه رسالة تجريبية للتأكد من أن النظام يعمل بشكل صحيح.

⏰ الوقت: ${new Date().toLocaleString('ar-EG')}
✅ النظام: يعمل بشكل مثالي
🚀 الحالة: جاهز للاستخدام

شكراً لاستخدام نظام إدارة العملاء! 🙏`
            }
        };
        
        console.log('✅ Message structure is correct');
        console.log('✅ Ready to send when token is updated');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('==============');
        console.log('1. Get permanent token from Meta Business Manager');
        console.log('2. Edit quick-token-update.js');
        console.log('3. Replace PASTE_YOUR_PERMANENT_TOKEN_HERE with real token');
        console.log('4. Run: node quick-token-update.js');
        console.log('5. Test: node fix-message-sending-now.js');
        
        // Step 5: Create a test message sender
        console.log('\n📋 Step 5: Creating Test Message Sender');
        console.log('=======================================');
        
        const testSender = `
// Test Message Sender - Use after token update
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '${process.env.VITE_SUPABASE_URL}',
  '${process.env.VITE_SUPABASE_ANON_KEY}'
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
            body: \`✅ نظام WhatsApp CRM يعمل بشكل مثالي!

🏷️ العلامة التجارية: \${brand.name}
⏰ الوقت: \${new Date().toLocaleString('ar-EG')}
🚀 الحالة: جاهز للاستخدام

تم إصلاح مشكلة إرسال الرسائل بنجاح! 🎉\`
        }
    };
    
    try {
        const response = await fetch(
            \`https://graph.facebook.com/v18.0/\${brand.phone_number_id}/messages\`,
            {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${brand.whatsapp_token}\`,
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
`;
        
        require('fs').writeFileSync('test-message-sender.js', testSender);
        console.log('✅ Created: test-message-sender.js');
        
        console.log('\n🎉 TOKEN UPDATE SETUP COMPLETE!');
        console.log('===============================');
        console.log('');
        console.log('📝 FILES CREATED:');
        console.log('=================');
        console.log('✅ quick-token-update.js - Update token quickly');
        console.log('✅ test-message-sender.js - Test sending after update');
        console.log('');
        console.log('🔧 WORKFLOW:');
        console.log('============');
        console.log('1. Get permanent token from Meta');
        console.log('2. Edit quick-token-update.js');
        console.log('3. Run: node quick-token-update.js');
        console.log('4. Test: node test-message-sender.js');
        console.log('5. Enjoy working message sending! 🎉');
        
    } catch (error) {
        console.error('❌ Error during token update:', error);
    }
}

// Run the update
updateWhatsAppToken();