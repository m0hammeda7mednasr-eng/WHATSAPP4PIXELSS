// Prepare Project for Production Deployment
import fs from 'fs';
import path from 'path';

console.log('\n🚀 تجهيز المشروع للنشر...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 1. Create .env.example
console.log('1️⃣  إنشاء .env.example...');
const envExample = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=whatsapp_crm_2024
WEBHOOK_PORT=3001

# Production API URL (update after deployment)
VITE_API_URL=https://your-backend.railway.app
`;

fs.writeFileSync('.env.example', envExample);
console.log('   ✅ تم إنشاء .env.example\n');

// 2. Create .gitignore
console.log('2️⃣  تحديث .gitignore...');
const gitignore = `# Dependencies
node_modules/

# Environment Variables
.env
.env.local
.env.production
.env.*.local

# Build Output
dist/
build/
.vite/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary
.tmp/
temp/
`;

fs.writeFileSync('.gitignore', gitignore);
console.log('   ✅ تم تحديث .gitignore\n');

// 3. Create vercel.json
console.log('3️⃣  إنشاء vercel.json...');
const vercelConfig = {
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('   ✅ تم إنشاء vercel.json\n');

// 4. Create railway.json
console.log('4️⃣  إنشاء railway.json...');
const railwayConfig = {
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/webhook-server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
console.log('   ✅ تم إنشاء railway.json\n');

// 5. Create netlify.toml
console.log('5️⃣  إنشاء netlify.toml...');
const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

fs.writeFileSync('netlify.toml', netlifyConfig);
console.log('   ✅ تم إنشاء netlify.toml\n');

// 6. Create deployment checklist
console.log('6️⃣  إنشاء deployment checklist...');
const checklist = `# 🚀 Deployment Checklist

## قبل النشر
- [ ] تحديث جميع الـ tokens
- [ ] التأكد من Storage Bucket
- [ ] التأكد من RLS Policies
- [ ] مراجعة .env
- [ ] التأكد من .gitignore

## Backend (Railway/Render)
- [ ] إنشاء حساب
- [ ] رفع الكود
- [ ] إضافة Environment Variables
- [ ] اختبار Health Check
- [ ] نسخ Backend URL

## Frontend (Vercel/Netlify)
- [ ] إنشاء حساب
- [ ] رفع الكود
- [ ] إضافة Environment Variables
- [ ] تحديث VITE_API_URL
- [ ] اختبار الموقع

## WhatsApp Configuration
- [ ] تحديث Webhook URL في Meta
- [ ] التأكد من Verify Token
- [ ] تفعيل Subscriptions
- [ ] اختبار إرسال واستقبال

## الاختبار النهائي
- [ ] تسجيل دخول
- [ ] إرسال رسالة نصية
- [ ] إرسال صورة
- [ ] تسجيل صوت
- [ ] استقبال رسائل
- [ ] حذف شات

## بعد النشر
- [ ] مراقبة Logs
- [ ] اختبار Performance
- [ ] إعداد Monitoring
- [ ] مشاركة الرابط مع الفريق

---

✅ تم النشر بنجاح!
`;

fs.writeFileSync('DEPLOYMENT-CHECKLIST.md', checklist);
console.log('   ✅ تم إنشاء DEPLOYMENT-CHECKLIST.md\n');

// 7. Check package.json scripts
console.log('7️⃣  فحص package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = {
    'dev': 'vite',
    'build': 'vite build',
    'preview': 'vite preview',
    'start': 'node server/webhook-server.js'
  };
  
  let scriptsOk = true;
  for (const [name, command] of Object.entries(requiredScripts)) {
    if (!packageJson.scripts || !packageJson.scripts[name]) {
      console.log(`   ⚠️  Script "${name}" غير موجود`);
      scriptsOk = false;
    }
  }
  
  if (scriptsOk) {
    console.log('   ✅ جميع Scripts موجودة\n');
  } else {
    console.log('   ℹ️  بعض Scripts محتاجة تحديث\n');
  }
} catch (error) {
  console.log('   ⚠️  خطأ في قراءة package.json\n');
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 ملخص التجهيز:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ الملفات المُنشأة:');
console.log('   - .env.example');
console.log('   - .gitignore');
console.log('   - vercel.json');
console.log('   - railway.json');
console.log('   - netlify.toml');
console.log('   - DEPLOYMENT-CHECKLIST.md\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 الخطوات التالية:\n');
console.log('1. راجع ملف: DEPLOY-TO-PRODUCTION.md');
console.log('2. راجع: DEPLOYMENT-CHECKLIST.md');
console.log('3. حدّث .env بالبيانات الصحيحة');
console.log('4. ارفع Backend على Railway');
console.log('5. ارفع Frontend على Vercel');
console.log('6. حدّث Webhook URL في Meta\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🚀 المشروع جاهز للنشر!\n');
