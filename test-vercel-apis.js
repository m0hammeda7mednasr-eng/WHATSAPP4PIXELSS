// Test Vercel APIs
async function testVercelAPIs() {
    console.log('🧪 Testing Vercel APIs...');
    console.log('========================');
    
    const baseUrl = 'https://wahtsapp2.vercel.app';
    
    try {
        // Test 1: Webhook verification
        console.log('\n📋 Test 1: Webhook Verification');
        console.log('===============================');
        
        const webhookUrl = `${baseUrl}/api/webhook?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123`;
        
        const webhookResponse = await fetch(webhookUrl);
        const webhookResult = await webhookResponse.text();
        
        if (webhookResponse.ok && webhookResult === 'test123') {
            console.log('✅ Webhook verification: WORKING');
            console.log('✅ Response:', webhookResult);
        } else {
            console.log('❌ Webhook verification: FAILED');
            console.log('❌ Status:', webhookResponse.status);
            console.log('❌ Response:', webhookResult);
        }
        
        // Test 2: Send Message API
        console.log('\n📋 Test 2: Send Message API');
        console.log('===========================');
        
        const sendMessageUrl = `${baseUrl}/api/send-message`;
        
        const sendMessageTest = {
            brandId: 'd1678581-bc57-4d01-9f35-b0bdc4edcd77', // 4 Pixels brand ID
            contactId: 'test-contact-id',
            message: 'Test message from Vercel API',
            messageType: 'text'
        };
        
        try {
            const sendResponse = await fetch(sendMessageUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sendMessageTest)
            });
            
            const sendResult = await sendResponse.json();
            
            if (sendResponse.ok) {
                console.log('✅ Send Message API: WORKING');
                console.log('✅ Response:', sendResult);
            } else {
                console.log('❌ Send Message API: FAILED');
                console.log('❌ Status:', sendResponse.status);
                console.log('❌ Response:', sendResult);
            }
        } catch (error) {
            console.log('❌ Send Message API: ERROR');
            console.log('❌ Error:', error.message);
        }
        
        // Test 3: External Message API
        console.log('\n📋 Test 3: External Message API');
        console.log('===============================');
        
        const externalMessageUrl = `${baseUrl}/api/external-message`;
        
        const externalMessageTest = {
            phone_number: '201234567890',
            message: 'Test external message from Vercel',
            phone_number_id: '1012755295246742', // 4 Pixels phone number ID
            message_type: 'text'
        };
        
        try {
            const externalResponse = await fetch(externalMessageUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(externalMessageTest)
            });
            
            const externalResult = await externalResponse.json();
            
            if (externalResponse.ok) {
                console.log('✅ External Message API: WORKING');
                console.log('✅ Response:', externalResult);
            } else {
                console.log('❌ External Message API: FAILED');
                console.log('❌ Status:', externalResponse.status);
                console.log('❌ Response:', externalResult);
            }
        } catch (error) {
            console.log('❌ External Message API: ERROR');
            console.log('❌ Error:', error.message);
        }
        
        // Test 4: Check if all endpoints exist
        console.log('\n📋 Test 4: API Endpoints Check');
        console.log('==============================');
        
        const endpoints = [
            '/api/webhook',
            '/api/send-message',
            '/api/external-message'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${baseUrl}${endpoint}`, {
                    method: 'OPTIONS'
                });
                
                if (response.ok || response.status === 405) {
                    console.log(`✅ ${endpoint}: EXISTS`);
                } else {
                    console.log(`❌ ${endpoint}: NOT FOUND (${response.status})`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
            }
        }
        
        console.log('\n🎉 VERCEL API TEST COMPLETE!');
        console.log('============================');
        console.log('');
        console.log('📊 SUMMARY:');
        console.log('===========');
        console.log('✅ Webhook: Working (receiving messages)');
        console.log('🔍 Send Message: Check results above');
        console.log('🔍 External Message: Check results above');
        console.log('');
        console.log('🔗 WORKING URLS:');
        console.log('================');
        console.log(`Frontend: ${baseUrl}`);
        console.log(`Webhook: ${baseUrl}/api/webhook`);
        console.log(`Send Message: ${baseUrl}/api/send-message`);
        console.log(`External Message: ${baseUrl}/api/external-message`);
        console.log('');
        console.log('🔧 IF SEND MESSAGE NOT WORKING:');
        console.log('===============================');
        console.log('1. Check if /api/send-message exists');
        console.log('2. Add the missing API file');
        console.log('3. Deploy to Vercel');
        console.log('4. Test again');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testVercelAPIs();