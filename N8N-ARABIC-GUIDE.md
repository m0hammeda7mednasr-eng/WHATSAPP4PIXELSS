# 🚀 دليل n8n بالعربي - استقبال وإرسال رسائل WhatsApp

## 📖 الفكرة ببساطة

**المطلوب:** لما عميل يبعت رسالة من WhatsApp، تظهر في الداشبورد فوراً. ولما ترد عليه من الداشبورد، الرسالة توصله على WhatsApp.

**الحل:** نستخدم n8n كوسيط بين WhatsApp والداشبورد.

---

## 🎯 الجزء الأول: استقبال الرسائل (Inbound)

### 🛠️ السيناريو (خطوة بخطوة):

1. **العميل:** يبعت رسالة من موبايله
2. **WhatsApp:** يبعت الرسالة لـ n8n (عن طريق Webhook)
3. **n8n:** يستلم الرسالة ويعالجها
4. **n8n:** يروح يرمي الرسالة في جدول `messages` في Supabase
5. **Supabase:** يبعت تنبيه للداشبورد (Realtime Event)
6. **الداشبورد:** تلاقي رسالة جديدة، فتطلعها في الشات فوراً

---

## ⚙️ التنفيذ العملي في n8n

### الخطوة 1️⃣: افتح n8n وإنشئ Workflow جديد

1. افتح n8n: `https://your-n8n.com`
2. اضغط **New Workflow**
3. سمّيه: `WhatsApp Inbound Messages`

---

### الخطوة 2️⃣: أضف Webhook Node (استقبال الرسالة)

1. اضغط **+** واختار **Webhook**
2. الإعدادات:
   - **HTTP Method:** `POST`
   - **Path:** `whatsapp-inbound`
   - **Response Mode:** `Using 'Respond to Webhook' Node`

3. **احفظ الـ URL** اللي هيظهر (هتحتاجه بعدين):
   ```
   https://your-n8n.com/webhook/whatsapp-inbound
   ```

---

### الخطوة 3️⃣: أضف Function Node (تحليل البيانات)

1. اضغط **+** واختار **Function**
2. سمّيه: `Parse WhatsApp Data`
3. الصق الكود ده:

```javascript
// استخراج بيانات الرسالة من WhatsApp
const body = $input.item.json.body;

const entry = body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const messages = value?.messages?.[0];
const contacts = value?.contacts?.[0];

if (!messages) {
  return { json: { error: 'No message found' } };
}

// البيانات المهمة
const wa_id = messages.from; // رقم العميل
const phone_number_id = value.metadata?.phone_number_id; // رقم البراند
const message_type = messages.type; // نوع الرسالة (text, image, etc.)

// استخراج نص الرسالة حسب النوع
let body_text = '';
let media_url = null;

if (message_type === 'text') {
  body_text = messages.text?.body || '';
} else if (message_type === 'image') {
  body_text = messages.image?.caption || '';
  media_url = messages.image?.id;
} else if (message_type === 'interactive') {
  body_text = messages.interactive?.button_reply?.title || 
              messages.interactive?.list_reply?.title || '';
}

// اسم العميل
const contact_name = contacts?.profile?.name || wa_id;

return {
  json: {
    wa_id,
    phone_number_id,
    message_type,
    body: body_text,
    media_url,
    contact_name,
    wa_message_id: messages.id
  }
};
```

---

### الخطوة 4️⃣: أضف Postgres Node (جيب الـ Brand ID)

1. اضغط **+** واختار **Postgres**
2. سمّيه: `Get Brand ID`
3. الإعدادات:
   - **Operation:** `Execute Query`
   - **Query:**
     ```sql
     SELECT id FROM brands 
     WHERE phone_number_id = '{{ $json.phone_number_id }}' 
     LIMIT 1
     ```

4. **Connection String** (من Supabase):
   ```
   postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
   ```

---

### الخطوة 5️⃣: أضف Postgres Node (إنشاء أو تحديث Contact)

1. اضغ **+** واختار **Postgres**
2. سمّيه: `Create or Update Contact`
3. الإعدادات:
   - **Operation:** `Execute Query`
   - **Query:**
     ```sql
     INSERT INTO contacts (brand_id, wa_id, name, last_message_at)
     VALUES (
       '{{ $node["Get Brand ID"].json[0].id }}',
       '{{ $node["Parse WhatsApp Data"].json.wa_id }}',
       '{{ $node["Parse WhatsApp Data"].json.contact_name }}',
       NOW()
     )
     ON CONFLICT (brand_id, wa_id) 
     DO UPDATE SET 
       name = EXCLUDED.name,
       last_message_at = NOW()
     RETURNING id
     ```

**الفكرة:** لو العميل موجود، هيحدث بياناته. لو مش موجود، هيضيفه جديد.

---

### الخطوة 6️⃣: أضف Postgres Node (حفظ الرسالة)

1. اضغط **+** واختار **Postgres**
2. سمّيه: `Insert Message`
3. الإعدادات:
   - **Operation:** `Execute Query`
   - **Query:**
     ```sql
     INSERT INTO messages (
       contact_id,
       brand_id,
       direction,
       message_type,
       body,
       media_url,
       status,
       wa_message_id,
       created_at
     )
     VALUES (
       '{{ $node["Create or Update Contact"].json[0].id }}',
       '{{ $node["Get Brand ID"].json[0].id }}',
       'inbound',
       '{{ $node["Parse WhatsApp Data"].json.message_type }}',
       '{{ $node["Parse WhatsApp Data"].json.body }}',
       '{{ $node["Parse WhatsApp Data"].json.media_url }}',
       'delivered',
       '{{ $node["Parse WhatsApp Data"].json.wa_message_id }}',
       NOW()
     )
     RETURNING *
     ```

**ملاحظة مهمة:**
- `direction: 'inbound'` ← عشان الداشبورد تعرف إن دي رسالة واردة (تظهر على الشمال، لون أبيض)
- `status: 'delivered'` ← الرسالة وصلت بنجاح

---

### الخطوة 7️⃣: أضف Respond to Webhook Node (رد على WhatsApp)

1. اضغط **+** واختار **Respond to Webhook**
2. الإعدادات:
   - **Respond With:** `JSON`
   - **Response Body:**
     ```json
     {
       "success": true,
       "message_id": "{{ $json[0].id }}"
     }
     ```

---

### الخطوة 8️⃣: وصّل الـ Nodes ببعض

```
Webhook → Parse Data → Get Brand ID → Create Contact → Insert Message → Respond
```

**اضغط على كل Node وشد خط للـ Node اللي بعده.**

---

### الخطوة 9️⃣: فعّل الـ Workflow

1. اضغط على زرار **Active** في أعلى اليمين
2. لازم يكون لونه أخضر ✅

---

## 🔗 ربط WhatsApp بـ n8n

### الخطوة 10: روح على Meta Developers

1. افتح: `https://developers.facebook.com/apps`
2. اختار الـ App بتاعك
3. روح على **WhatsApp > Configuration**
4. في قسم **Webhooks**:
   - **Callback URL:** الصق الـ URL من n8n:
     ```
     https://your-n8n.com/webhook/whatsapp-inbound
     ```
   - **Verify Token:** اكتب أي كلمة سر (مثلاً: `my_secret_token`)
   - **Webhook Fields:** اختار `messages`

5. اضغط **Verify and Save**

---

## 🧪 اختبار الـ Workflow

### الطريقة 1: من Terminal (سريع)

```bash
curl -X POST https://your-n8n.com/webhook/whatsapp-inbound \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "metadata": {
            "phone_number_id": "123456789"
          },
          "messages": [{
            "from": "201111111111",
            "id": "wamid.test123",
            "type": "text",
            "text": {
              "body": "مرحباً! رسالة تجريبية"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "عميل تجريبي"
            }
          }]
        }
      }]
    }]
  }'
```

### الطريقة 2: من Node.js (أسهل)

```bash
node test-inbound-message.js
```

### الطريقة 3: من WhatsApp (حقيقي)

1. ابعت رسالة من موبايلك لرقم WhatsApp Business
2. شوف الرسالة ظهرت في الداشبورد ولا لأ

---

## ✅ التأكد من النجاح

**لو كل حاجة تمام، هتشوف:**

1. ✅ في n8n: Execution log أخضر
2. ✅ في Supabase: رسالة جديدة في جدول `messages`
3. ✅ في الداشبورد: الرسالة ظهرت في الشات فوراً

---

## 🎯 الجزء الثاني: إرسال الرسائل (Outbound)

### 🛠️ السيناريو (خطوة بخطوة):

1. **أنت:** تكتب رسالة في الداشبورد وتضغط Send
2. **الداشبورد:** يحفظ الرسالة في Supabase (direction: 'outbound')
3. **Supabase:** يشغّل Webhook ويبعت البيانات لـ n8n
4. **n8n:** يستلم البيانات ويجهزها
5. **n8n:** يبعت الرسالة لـ WhatsApp API
6. **WhatsApp:** يوصل الرسالة للعميل
7. **n8n:** يحدث status في Supabase (delivered)

---

## ⚙️ التنفيذ العملي

### الخطوة 1️⃣: إنشاء Webhook في Supabase

1. افتح Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/database/webhooks
   ```

2. اضغط **Create a new hook**

3. الإعدادات:
   - **Name:** `send-whatsapp-message`
   - **Table:** `messages`
   - **Events:** اختار `INSERT` فقط
   - **Type:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** `https://your-n8n.com/webhook/whatsapp-outbound`
   - **HTTP Headers:**
     ```json
     {
       "Content-Type": "application/json"
     }
     ```
   - **Conditions (SQL Filter):**
     ```sql
     direction = 'outbound'
     ```

4. اضغط **Create webhook**

**الفكرة:** الـ Webhook ده هيشتغل بس لما رسالة جديدة تتحفظ بـ `direction = 'outbound'`

---

### الخطوة 2️⃣: إنشاء Workflow جديد في n8n

1. افتح n8n
2. اضغط **New Workflow**
3. سمّيه: `WhatsApp Outbound Messages`

---

### الخطوة 3️⃣: أضف Webhook Node

1. اضغط **+** واختار **Webhook**
2. الإعدادات:
   - **HTTP Method:** `POST`
   - **Path:** `whatsapp-outbound`
   - **Response Mode:** `Immediately`

---

### الخطوة 4️⃣: أضف Postgres Node (جيب بيانات الرسالة)

1. اضغط **+** واختار **Postgres**
2. سمّيه: `Get Message Data`
3. الإعدادات:
   - **Operation:** `Execute Query`
   - **Query:**
     ```sql
     SELECT 
       m.*,
       c.wa_id,
       c.name as contact_name,
       b.phone_number_id,
       b.name as brand_name
     FROM messages m
     JOIN contacts c ON m.contact_id = c.id
     JOIN brands b ON m.brand_id = b.id
     WHERE m.id = '{{ $json.record.id }}'
     ```

**الفكرة:** نجيب كل البيانات اللي محتاجينها (رقم العميل، رقم البراند، نص الرسالة)

---

### الخطوة 5️⃣: أضف Function Node (تجهيز البيانات لـ WhatsApp)

1. اضغط **+** واختار **Function**
2. سمّيه: `Format for WhatsApp`
3. الصق الكود ده:

```javascript
const message = $input.item.json[0];

// تجهيز البيانات بالشكل اللي WhatsApp API عايزه
return {
  json: {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: message.wa_id,
    type: message.message_type || "text",
    text: {
      body: message.body
    }
  }
};
```

---

### الخطوة 6️⃣: أضف HTTP Request Node (إرسال لـ WhatsApp)

1. اضغط **+** واختار **HTTP Request**
2. سمّيه: `Send to WhatsApp`
3. الإعدادات:
   - **Method:** `POST`
   - **URL:**
     ```
     https://graph.facebook.com/v18.0/{{ $node["Get Message Data"].json[0].phone_number_id }}/messages
     ```
   - **Authentication:** `Header Auth`
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_WHATSAPP_ACCESS_TOKEN`
   - **Body Content Type:** `JSON`
   - **Specify Body:** `Using JSON`
   - **JSON:** `{{ $json }}`

**ملاحظة:** استبدل `YOUR_WHATSAPP_ACCESS_TOKEN` بالـ Token الحقيقي من Meta Developers.

---

### الخطوة 7️⃣: أضف Postgres Node (تحديث الـ Status)

1. اضغط **+** واختار **Postgres**
2. سمّيه: `Update Status`
3. الإعدادات:
   - **Operation:** `Execute Query`
   - **Query:**
     ```sql
     UPDATE messages 
     SET 
       status = 'delivered',
       wa_message_id = '{{ $json.messages[0].id }}'
     WHERE id = '{{ $node["Get Message Data"].json[0].id }}'
     ```

---

### الخطوة 8️⃣: وصّل الـ Nodes

```
Webhook → Get Data → Format → Send to WhatsApp → Update Status
```

---

### الخطوة 9️⃣: فعّل الـ Workflow

اضغط **Active** ✅

---

## 🧪 اختبار الإرسال

1. افتح الداشبورد: `http://localhost:5177/`
2. اختار أي عميل
3. اكتب رسالة واضغط Send
4. شوف:
   - ✅ الرسالة ظهرت في الشات (لون أزرق، على اليمين)
   - ✅ في n8n: Execution log أخضر
   - ✅ في WhatsApp: الرسالة وصلت للعميل

---

## 🔧 حل المشاكل الشائعة

### المشكلة 1: الرسائل الواردة مش بتظهر

**الحل:**
1. تأكد إن الـ Workflow في n8n **Active** ✅
2. تأكد إن الـ Webhook URL صح في Meta Developers
3. تأكد إن عندك Brand في Supabase بنفس الـ `phone_number_id`
4. جرب الاختبار بـ curl أو `test-inbound-message.js`

### المشكلة 2: الرسائل الصادرة مش بتتبعت

**الحل:**
1. تأكد إن الـ Webhook في Supabase متعمل صح
2. تأكد إن الـ Condition: `direction = 'outbound'`
3. تأكد إن الـ WhatsApp Access Token صحيح
4. شوف الـ Execution log في n8n (هيقولك المشكلة فين)

### المشكلة 3: الرسائل بتظهر بس مش في الشات الصح

**الحل:**
- تأكد إن الـ `contact_id` في جدول `messages` صحيح
- تأكد إن الـ `brand_id` مظبوط
- شوف جدول `contacts` وتأكد إن العميل موجود

---

## 📋 Checklist النهائي

### Inbound (استقبال):
- [ ] n8n Workflow متعمل ومفعّل
- [ ] Webhook Node موجود
- [ ] Parse Function موجودة
- [ ] Postgres Nodes (Get Brand, Create Contact, Insert Message)
- [ ] Respond to Webhook Node
- [ ] WhatsApp Webhook مربوط بـ n8n
- [ ] الاختبار نجح ✅

### Outbound (إرسال):
- [ ] Supabase Webhook متعمل
- [ ] Webhook Condition: `direction = 'outbound'`
- [ ] n8n Workflow متعمل ومفعّل
- [ ] Postgres Node (Get Data)
- [ ] Function Node (Format)
- [ ] HTTP Request Node (WhatsApp API)
- [ ] Postgres Node (Update Status)
- [ ] WhatsApp Access Token صحيح
- [ ] الاختبار نجح ✅

---

## 🎉 تهانينا!

لو كل حاجة اشتغلت، يبقى عندك دلوقتي:
- ✅ استقبال رسائل WhatsApp في الوقت الفعلي
- ✅ إرسال رسائل من الداشبورد لـ WhatsApp
- ✅ Multi-Tenant CRM كامل

**استمتع بالنظام! 🚀**

---

## 📞 محتاج مساعدة؟

لو حصلت أي مشكلة:
1. شوف الـ Execution logs في n8n
2. شوف الـ Webhook logs في Supabase
3. جرب الاختبار بـ `test-inbound-message.js`
4. تأكد من الـ Connection Strings والـ Tokens

**بالتوفيق! 💪**
