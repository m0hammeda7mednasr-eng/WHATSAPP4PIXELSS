// Fix Message Sending - Complete Solution
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixMessageSendingComplete() {
    console.log('🔧 FIXING MESSAGE SENDING - COMPLETE SOLUTION');
    console.log('==============================================');
    
    try {
        // Step 1: Get working token from recent messages
        console.log('\n📋 Step 1: Finding Working Token');
        console.log('================================');
        
        // Check recent successful messages to find working token
        const { data: recentMessages } = await supabase
            .from('messages')
            .select(`
                *,
                brands(*)
            `)
            .eq('direction', 'outbound')
            .eq('status', 'delivered')
            .order('created_at', { ascending: false })
            .limit(5);
            
        let workingBrand = null;
        
        if (recentMessages && recentMessages.length > 0) {
            workingBrand = recentMessages[0].brands;
            console.log('✅ Found working brand from recent messages:', workingBrand.name);
        } else {
            // Get any brand with token
            const { data: brands } = await supabase
                .from('brands')
                .select('*')
                .not('whatsapp_token', 'is', null)
                .limit(1);
                
            if (brands && brands.length > 0) {
                workingBrand = brands[0];
                console.log('✅ Using available brand:', workingBrand.name);
            }
        }
        
        if (!workingBrand) {
            console.log('❌ No brand with token found');
            return;
        }
        
        // Step 2: Test current token
        console.log('\n📋 Step 2: Testing Current Token');
        console.log('================================');
        
        const testMessage = {
            messaging_product: 'whatsapp',
            to: '201234567890',
            type: 'text',
            text: {
                body: `🧪 Test from ${workingBrand.name}\nTime: ${new Date().toLocaleString('ar-EG')}`
            }
        };
        
        console.log('📤 Testing message send...');
        
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${workingBrand.phone_number_id}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${workingBrand.whatsapp_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testMessage)
            }
        );
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ TOKEN IS WORKING!');
            console.log('✅ Message sent successfully');
            console.log('✅ Message ID:', result.messages?.[0]?.id);
        } else {
            console.log('❌ Token failed:', result.error?.message);
            
            if (result.error?.code === 190) {
                console.log('🔧 TOKEN EXPIRED - NEED NEW ONE');
                await generateNewTokenInstructions();
                return;
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function generateNewTokenInstructions() {
    console.log('\n🔧 GET NEW PERMANENT TOKEN:');
    console.log('===========================');
    console.log('1. Go to: https://business.facebook.com');
    console.log('2. System Users → Create/Edit User');
    console.log('3. Generate Access Token');
    console.log('4. Never expires + whatsapp permissions');
    console.log('5. Copy token and update database');
}

fixMessageSendingComplete();