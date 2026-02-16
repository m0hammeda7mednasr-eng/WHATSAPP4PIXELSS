// Build Shopify OAuth URL
console.log('🔗 Shopify OAuth URL Builder\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// تعديل البيانات دي:
const config = {
  ngrokUrl: 'https://nonsaturated-dennis-noncosmically.ngrok-free.dev',  // من ngrok
  shopUrl: 'YOUR_STORE.myshopify.com',  // متجر Shopify
  brandId: 'YOUR_BRAND_ID',  // من get-brand-info.js
  clientId: 'YOUR_CLIENT_ID',  // من Shopify App
  clientSecret: 'YOUR_CLIENT_SECRET'  // من Shopify App
};

// بناء الـ URL
const oauthUrl = `${config.ngrokUrl}/api/shopify/oauth/install?` +
  `shop=${config.shopUrl}&` +
  `brand_id=${config.brandId}&` +
  `client_id=${config.clientId}&` +
  `client_secret=${config.clientSecret}`;

console.log('📋 Your Configuration:');
console.log(`   ngrok URL: ${config.ngrokUrl}`);
console.log(`   Shop: ${config.shopUrl}`);
console.log(`   Brand ID: ${config.brandId}`);
console.log(`   Client ID: ${config.clientId}`);
console.log(`   Client Secret: ${config.clientSecret.substring(0, 10)}...`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🔗 OAuth URL:\n');
console.log(oauthUrl);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 Instructions:');
console.log('1. عدّل البيانات في الملف ده (build-shopify-url.js)');
console.log('2. شغّل: node build-shopify-url.js');
console.log('3. انسخ الـ URL وافتحه في المتصفح');
console.log('4. اعمل authorize للـ App');
console.log('\n✅ Done!\n');
