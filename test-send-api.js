// اختبار الـ send message API
async function testSendAPI() {
  console.log('🧪 Testing send message API...\n');

  const testData = {
    contact_id: '9fd59324-5eeb-44e5-9068-e3850e9f1838',
    brand_id: 'd1678581-bc57-4d01-9f35-b0bdc4edcd77',
    message: 'Test message from script'
  };

  console.log('📤 Sending:', testData);

  try {
    const response = await fetch('http://localhost:3001/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('\n📥 Response status:', response.status);
    console.log('📥 Response:', result);

    if (result.success) {
      console.log('\n✅ Success!');
    } else {
      console.log('\n❌ Failed:', result.error);
      if (result.details) {
        console.log('   Details:', result.details);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testSendAPI();
