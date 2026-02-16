// Test Netlify Webhook Function
const https = require('https');

async function testNetlifyWebhook() {
    console.log('🧪 Testing Netlify Webhook Function...');
    console.log('=====================================');
    
    // Get site URL from environment or use localhost for local testing
    const siteUrl = process.env.URL || 'http://localhost:8888';
    const webhookUrl = `${siteUrl}/.netlify/functions/webhook`;
    
    console.log('🔗 Testing URL:', webhookUrl);
    
    try {
        // Test 1: GET request (webhook verification)
        console.log('\n📋 Test 1: Webhook Verification (GET)');
        console.log('=====================================');
        
        const verifyUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=whatsapp_crm_2024&hub.challenge=test123`;
        
        const getResponse = await fetch(verifyUrl);
        const getResult = await getResponse.text();
        
        if (getResponse.ok && getResult === 'test123') {
            console.log('✅ Webhook verification: PASSED');
            console.log('✅ Challenge response:', getResult);
        } else {
            console.log('❌ Webhook verification: FAILED');
            console.log('❌ Status:', getResponse.status);
            console.log('❌ Response:', getResult);
        }
        
        // Test 2: POST request (message processing)
        console.log('\n📋 Test 2: Message Processing (POST)');
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
                            id: 'test_message_id',
                            from: '201234567890',
                            timestamp: Math.floor(Date.now() / 1000).toString(),
                            type: 'text',
                            text: {
                                body: 'Test message from Netlify'
                            }
                        }],
                        contacts: [{
                            profile: {
                                name: 'Test User'
                            }
                        }]
                    }
                }]
            }]
        };
        
        const postResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testMessage)
        });
        
        const postResult = await postResponse.json();
        
        if (postResponse.ok) {
            console.log('✅ Message processing: PASSED');
            console.log('✅ Response:', postResult);
        } else {
            console.log('❌ Message processing: FAILED');
            console.log('❌ Status:', postResponse.status);
            console.log('❌ Response:', postResult);
        }
        
        // Test 3: Button click simulation
        console.log('\n📋 Test 3: Button Click Simulation');
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
                            id: 'test_button_message_id',
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
        
        const buttonResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buttonMessage)
        });
        
        const buttonResult = await buttonResponse.json();
        
        if (buttonResponse.ok) {
            console.log('✅ Button click processing: PASSED');
            console.log('✅ Response:', buttonResult);
        } else {
            console.log('❌ Button click processing: FAILED');
            console.log('❌ Status:', buttonResponse.status);
            console.log('❌ Response:', buttonResult);
        }
        
        console.log('\n🎉 Netlify Webhook Test Complete!');
        console.log('==================================');
        console.log('✅ All tests completed');
        console.log('🔗 Webhook URL for Meta:', webhookUrl);
        console.log('🔑 Verify Token: whatsapp_crm_2024');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 If testing locally:');
        console.log('1. Run: netlify dev');
        console.log('2. Then run this test again');
        console.log('\n💡 If testing deployed site:');
        console.log('1. Make sure the site is deployed');
        console.log('2. Check environment variables are set');
        console.log('3. Check function logs in Netlify dashboard');
    }
}

// Run the test
testNetlifyWebhook();