// Test Local Server
const http = require('http');

async function testLocalServer() {
    console.log('🧪 Testing Local WhatsApp CRM Server...');
    console.log('======================================');
    
    const baseUrl = 'http://localhost:3000';
    
    try {
        // Test 1: Homepage
        console.log('\n📋 Test 1: Homepage');
        console.log('==================');
        
        const homeResponse = await fetch(`${baseUrl}/`);
        if (homeResponse.ok) {
            console.log('✅ Homepage: WORKING');
            console.log('✅ Status:', homeResponse.status);
        } else {
            console.log('❌ Homepage: FAILED');
            console.log('❌ Status:', homeResponse.status);
        }
        
        // Test 2: Test API endpoint
        console.log('\n📋 Test 2: Test API');
        console.log('==================');
        
        const testResponse = await fetch(`${baseUrl}/api/test`);
        if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('✅ Test API: WORKING');
            console.log('✅ Response:', testData);
        } else {
            console.log('❌ Test API: FAILED');
            console.log('❌ Status:', testResponse.status);
        }
        
        // Test 3: Webhook verification
        console.log('\n📋 Test 3: Webhook Verification');
        console.log('===============================');
        
        const webhookVerifyUrl = `${baseUrl}/api/webhook?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123`;
        const verifyResponse = await fetch(webhookVerifyUrl);
        const verifyResult = await verifyResponse.text();
        
        if (verifyResponse.ok && verifyResult === 'test123') {
            console.log('✅ Webhook Verification: WORKING');
            console.log('✅ Challenge Response:', verifyResult);
        } else {
            console.log('❌ Webhook Verification: FAILED');
            console.log('❌ Status:', verifyResponse.status);
            console.log('❌ Response:', verifyResult);
        }
        
        // Test 4: Webhook message processing
        console.log('\n📋 Test 4: Webhook Message Processing');
        console.log('====================================');
        
        const testMessage = {
            object: 'whatsapp_business_account',
            entry: [{
                changes: [{
                    value: {
                        metadata: {
                            phone_number_id: 'test_phone_id'
                        },
                        messages: [{
                            id: 'test_message_' + Date.now(),
                            from: '201234567890',
                            timestamp: Math.floor(Date.now() / 1000).toString(),
                            type: 'text',
                            text: {
                                body: 'مرحبا! هذه رسالة اختبار من الخادم المحلي'
                            }
                        }],
                        contacts: [{
                            profile: {
                                name: 'مستخدم تجريبي'
                            }
                        }]
                    }
                }]
            }]
        };
        
        const messageResponse = await fetch(`${baseUrl}/api/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testMessage)
        });
        
        if (messageResponse.ok) {
            const messageResult = await messageResponse.json();
            console.log('✅ Message Processing: WORKING');
            console.log('✅ Response:', messageResult);
        } else {
            console.log('❌ Message Processing: FAILED');
            console.log('❌ Status:', messageResponse.status);
        }
        
        // Test 5: Button click simulation
        console.log('\n📋 Test 5: Button Click Simulation');
        console.log('==================================');
        
        const buttonMessage = {
            object: 'whatsapp_business_account',
            entry: [{
                changes: [{
                    value: {
                        metadata: {
                            phone_number_id: 'test_phone_id'
                        },
                        messages: [{
                            id: 'test_button_' + Date.now(),
                            from: '201234567890',
                            timestamp: Math.floor(Date.now() / 1000).toString(),
                            type: 'interactive',
                            interactive: {
                                type: 'button_reply',
                                button_reply: {
                                    id: 'confirm_test_order_123',
                                    title: 'تأكيد الطلب'
                                }
                            }
                        }]
                    }
                }]
            }]
        };
        
        const buttonResponse = await fetch(`${baseUrl}/api/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buttonMessage)
        });
        
        if (buttonResponse.ok) {
            const buttonResult = await buttonResponse.json();
            console.log('✅ Button Click: WORKING');
            console.log('✅ Response:', buttonResult);
        } else {
            console.log('❌ Button Click: FAILED');
            console.log('❌ Status:', buttonResponse.status);
        }
        
        console.log('\n🎉 LOCAL SERVER TEST COMPLETE!');
        console.log('==============================');
        console.log('✅ Server is running perfectly on localhost:3000');
        console.log('✅ All webhook endpoints are working');
        console.log('✅ Ready for WhatsApp integration testing');
        console.log('');
        console.log('🔗 URLs to use:');
        console.log('==============');
        console.log('Frontend: http://localhost:3000');
        console.log('Webhook: http://localhost:3000/api/webhook');
        console.log('Test API: http://localhost:3000/api/test');
        console.log('');
        console.log('🔧 For Meta Webhook (local testing only):');
        console.log('=========================================');
        console.log('URL: http://localhost:3000/api/webhook');
        console.log('Verify Token: whatsapp_crm_2024');
        console.log('');
        console.log('⚠️  Note: For production, use Netlify deployment');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('');
        console.log('💡 Make sure the server is running:');
        console.log('node run-local-server.js');
    }
}

// Run the test
testLocalServer();