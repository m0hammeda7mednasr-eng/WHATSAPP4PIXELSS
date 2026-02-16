@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║       🧪 COMPLETE ORDERS TEST - EVERYTHING! 🧪                ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo 📋 هذا الاختبار الشامل سيفحص:
echo    ✓ الـ Database والجداول
echo    ✓ الـ Shopify Connection
echo    ✓ الـ Brand والـ WhatsApp Token
echo    ✓ الـ Contacts
echo    ✓ الـ Orders الموجودة
echo    ✓ الـ Server والـ Webhook
echo    ✓ إرسال order تجريبي
echo    ✓ حفظ الـ order في الـ database
echo    ✓ عرض الـ order في الموقع
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              STEP 1: DATABASE AND CONFIGURATION               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

node test-shopify-complete.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 راجع النتائج أعلاه:
echo.

set /p db_ok="هل كل الجداول موجودة والـ connection شغال؟ (Y/N): "
if /i not "%db_ok%"=="Y" (
    echo.
    echo ❌ في مشكلة في الـ Database!
    echo.
    echo 🔧 الحل:
    echo    1. افتح Supabase: https://rmpgofswkpjxionzythf.supabase.co
    echo    2. روح SQL Editor
    echo    3. افتح ملف: FIX-ORDERS-NOW.sql
    echo    4. انسخ كل المحتوى والصقه
    echo    5. اضغط Run
    echo    6. شغل الاختبار تاني
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ تمام! الـ Database جاهز
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              STEP 2: SERVER STATUS CHECK                      ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 جاري فحص السيرفر...
echo.

curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ السيرفر شغال على port 3001
    echo.
    set server_running=yes
) else (
    echo ⚠️  السيرفر مش شغال!
    echo.
    set server_running=no
)

if "%server_running%"=="no" (
    echo 🚀 هل تريد تشغيل السيرفر الآن؟ (Y/N^)
    set /p start_server=
    
    if /i "!start_server!"=="Y" (
        echo.
        echo 🚀 جاري تشغيل السيرفر...
        echo.
        cd server
        start "🖥️ Backend Server - Orders Test" cmd /k "echo. && echo ╔═══════════════════════════════════════════════════════════════╗ && echo ║              BACKEND SERVER - ORDERS TEST                     ║ && echo ╚═══════════════════════════════════════════════════════════════╝ && echo. && node webhook-server-simple.js"
        cd ..
        
        echo ✅ السيرفر بدأ في نافذة منفصلة
        echo.
        echo ⏳ انتظار 5 ثواني للسيرفر يبدأ...
        timeout /t 5 /nobreak > nul
        echo.
    ) else (
        echo.
        echo ❌ لازم السيرفر يكون شغال عشان نكمل الاختبار!
        echo.
        echo 💡 شغله يدوياً:
        echo    cd wahtsapp-main\server
        echo    node webhook-server-simple.js
        echo.
        pause
        exit /b 1
    )
)

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              STEP 3: WEBHOOK TEST (SEND TEST ORDER)           ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 📤 جاري إرسال order تجريبي للـ webhook...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node test-webhook-direct.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

set /p webhook_ok="هل الـ webhook استقبل الـ order بنجاح؟ (Y/N): "
if /i not "%webhook_ok%"=="Y" (
    echo.
    echo ❌ في مشكلة في الـ Webhook!
    echo.
    echo 🔍 راجع الـ server logs في النافذة التانية
    echo    ابحث عن: "❌ Error" أو "⚠️  Warning"
    echo.
    echo 💡 المشاكل الشائعة:
    echo    1. السيرفر مش شغال
    echo    2. الـ connection مش موجود
    echo    3. الـ brand_id غلط
    echo    4. مشكلة في حفظ الـ order
    echo.
    pause
    
    echo.
    echo 📋 عايز تشوف الـ server logs دلوقتي؟ (Y/N^)
    set /p show_logs=
    
    if /i "!show_logs!"=="Y" (
        echo.
        echo 💡 روح للنافذة اللي فيها السيرفر وشوف الـ logs
        echo    ابحث عن آخر رسالة "📥 Shopify Webhook received"
        echo    وشوف إيه اللي حصل بعدها
        echo.
    )
    
    pause
    exit /b 1
)

echo.
echo ✅ تمام! الـ Webhook شغال
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              STEP 4: VERIFY ORDER IN DATABASE                 ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 دلوقتي لازم تتحقق من الـ order في الـ database:
echo.
echo 📍 افتح Supabase:
echo    https://rmpgofswkpjxionzythf.supabase.co
echo.
echo 📍 روح Table Editor → shopify_orders
echo.
echo 📍 لازم تلاقي order جديد فيه:
echo    ✓ shopify_order_number: 1234
echo    ✓ customer_phone: 201066184859
echo    ✓ total_price: 250.00
echo    ✓ confirmation_status: pending
echo    ✓ created_at: دلوقتي (قبل دقيقة)
echo.
echo 🌐 فتح Supabase في المتصفح؟ (Y/N^)
set /p open_supabase=

if /i "%open_supabase%"=="Y" (
    start https://rmpgofswkpjxionzythf.supabase.co/project/_/editor
    echo.
    echo ✅ تم فتح Supabase
    echo    روح Table Editor → shopify_orders
    echo.
)

echo.
set /p db_order_ok="هل الـ order موجود في الـ database؟ (Y/N): "
if /i not "%db_order_ok%"=="Y" (
    echo.
    echo ❌ الـ Order مش موجود في الـ Database!
    echo.
    echo 🔍 راجع الـ server logs:
    echo    لازم تلاقي: "✅ Order saved to database: xxx"
    echo.
    echo 💡 لو مش موجودة، يبقى في error في الحفظ
    echo    ابحث عن: "❌ Error saving order"
    echo.
    echo 🔧 الحلول المحتملة:
    echo    1. شغل FIX-ORDERS-NOW.sql في Supabase
    echo    2. أعد تشغيل السيرفر
    echo    3. جرب تاني
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ تمام! الـ Order موجود في الـ Database
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              STEP 5: VERIFY ORDER IN WEBSITE                  ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 دلوقتي لازم تتحقق من الـ order في الموقع:
echo.
echo 📍 افتح الموقع:
echo    http://localhost:5173
echo.
echo 📍 اضغط على أيقونة Settings (⚙️)
echo.
echo 📍 اختر تاب "Orders" أو "الطلبات"
echo.
echo 📍 لازم تشوف الـ order الجديد:
echo    ✓ طلب #1234
echo    ✓ العميل: أحمد محمد
echo    ✓ الهاتف: 01066184859
echo    ✓ الإجمالي: 250.00 EGP
echo    ✓ الحالة: في الانتظار
echo.
echo 🌐 فتح الموقع في المتصفح؟ (Y/N^)
set /p open_website=

if /i "%open_website%"=="Y" (
    start http://localhost:5173
    echo.
    echo ✅ تم فتح الموقع
    echo    روح Settings → Orders
    echo.
)

echo.
set /p website_order_ok="هل الـ order ظاهر في الموقع؟ (Y/N): "
if /i not "%website_order_ok%"=="Y" (
    echo.
    echo ❌ الـ Order مش ظاهر في الموقع!
    echo.
    echo 🔍 الأسباب المحتملة:
    echo    1. الـ brand_id مش متطابق
    echo    2. الـ frontend مش بيقرأ من الـ database صح
    echo    3. في error في الـ console
    echo.
    echo 💡 افتح Developer Console (F12) وشوف في errors
    echo.
    echo 🔧 الحل السريع:
    echo    1. اضغط Ctrl+F5 (Hard Refresh)
    echo    2. لو لسه مش ظاهر، شوف الـ Console errors
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ تمام! الـ Order ظاهر في الموقع
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              STEP 6: WHATSAPP MESSAGE CHECK                   ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 📱 هل تم إرسال رسالة WhatsApp؟
echo.
echo 💡 راجع الـ server logs:
echo    لازم تلاقي: "✅ WhatsApp message sent: xxx"
echo.
echo 📱 لو الـ WhatsApp Token موجود، العميل لازم يستلم رسالة
echo.

set /p whatsapp_ok="هل تم إرسال رسالة WhatsApp؟ (Y/N/Skip): "
if /i "%whatsapp_ok%"=="Y" (
    echo.
    echo ✅ تمام! رسالة WhatsApp اتبعتت
    echo.
) else if /i "%whatsapp_ok%"=="N" (
    echo.
    echo ⚠️  رسالة WhatsApp مش اتبعتت
    echo.
    echo 💡 الأسباب المحتملة:
    echo    1. WhatsApp Token مش موجود
    echo    2. Token غلط أو expired
    echo    3. Phone Number ID غلط
    echo.
    echo 🔧 الحل:
    echo    روح Settings → Brand Settings
    echo    تأكد من:
    echo    ✓ WhatsApp Token موجود
    echo    ✓ Phone Number ID موجود
    echo.
) else (
    echo.
    echo ⏭️  تم تخطي فحص WhatsApp
    echo.
)

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    🎉 FINAL REPORT 🎉                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo ┌───────────────────────────────────────────────────────────────┐
echo │                    ✅ ORDERS SYSTEM STATUS                     │
echo ├───────────────────────────────────────────────────────────────┤
echo │                                                               │
echo │  ✅ Database: Working                                         │
echo │  ✅ Shopify Connection: Active                                │
echo │  ✅ Server: Running                                           │
echo │  ✅ Webhook: Receiving Orders                                 │
echo │  ✅ Database: Saving Orders                                   │
echo │  ✅ Website: Displaying Orders                                │
if /i "%whatsapp_ok%"=="Y" (
echo │  ✅ WhatsApp: Sending Messages                                │
) else (
echo │  ⚠️  WhatsApp: Not Configured                                 │
)
echo │                                                               │
echo └───────────────────────────────────────────────────────────────┘
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                    🚀 NEXT STEPS                              ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 1️⃣  شغل ngrok للـ webhook الحقيقي:
echo    ngrok http 3001
echo.
echo 2️⃣  سجل الـ webhook في Shopify Admin:
echo    URL: https://your-ngrok-url.ngrok-free.dev/api/shopify/webhook
echo    Event: Order creation
echo    Format: JSON
echo.
echo 3️⃣  اعمل order حقيقي من Shopify:
echo    Shopify Admin → Orders → Create order
echo.
echo 4️⃣  راقب النتائج:
echo    ✓ Server logs
echo    ✓ Supabase database
echo    ✓ Website Orders page
echo    ✓ WhatsApp messages
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🎉 تم اختبار كل حاجة بنجاح!
echo.
echo 💡 السيرفر لسه شغال في النافذة التانية
echo    لو عايز توقفه، اضغط Ctrl+C
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
