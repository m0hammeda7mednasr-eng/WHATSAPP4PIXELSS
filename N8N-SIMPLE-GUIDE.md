# 🚀 n8n Setup - الدليل البسيط

## المشكلة: الرسائل الواردة من WhatsApp مش بتظهر في الـ UI

### الحل: محتاج تعمل n8n workflow يستقبل الرسائل ويحطها في الـ database

---

## 📥 Part 1: Inbound Messages (WhatsApp → UI)

### الخطوات:

#### 1. افتح n8n وعمل Workflow جديد

**اسمه:** "WhatsApp Inbound"

#### 2. ضيف Webhook Node

- **HTTP Method:** POST
- **Path:** `whatsapp-inbound`
- **Response Mode:** "Using 'Respond to Webhook' Node"

**انسخ الـ Production URL:**
```
https://your-n8n.com/webhook/whatsapp-inbound
```

#### 3. ضيف Postgres Node #1 (Get Brand)

- **Operation:** Execute Query
- **Query:**
```sql
SELECT id FROM brands 
WHERE phone_number_id = '{{ $json.entry[0].changes[0].value.metadata.phone_number_id }}' 
LIMIT 1
```

**Connection:**
```
Host: aws-1-eu-west-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.rmpgofswkpjxionzythf
Password: 01066184859mM
SSL: require
```

#### 4. ضيف Postgres Node #2 (Create Contact)

- **Operation:** Execute Query
- **Query:**
```sql
INSERT INTO contacts (brand_id, wa_id, name, last_message_at)
VALUES (
  '{{ $node["Postgres"].json[0].id }}',
  '{{ $json.entry[0].changes[0].value.messages[0].from }}',
  '{{ $json.entry[0].changes[0].value.contacts[0].profile.name }}',
  NOW()
)
ON CONFLICT (brand_id, wa_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  last_message_at = NOW()
RETURNING id
```

#### 5. ضيف Postgres Node #3 (Insert Message)

- **Operation:** Execute Query
- **Query:**
```sql
INSERT INTO messages (
  contact_id,
  brand_id,
  direction,
  message_type,
  body,
  status,
  wa_message_id,
  created_at
)
VALUES (
  '{{ $node["Postgres1"].json[0].id }}',
  '{{ $node["Postgres"].json[0].id }}',
  'inbound',
  '{{ $json.entry[0].changes[0].value.messages[0].type }}',
  '{{ $json.entry[0].changes[0].value.messages[0].text.body }}',
  'delivered',
  '{{ $json.entry[0].changes[0].value.messages[0].id }}',
  NOW()
)
RETURNING *
```

#### 6. ضيف Respond to Webhook Node

- **Respond With:** JSON
- **Response Body:**
```json
{
  "success": true
}
```

#### 7. وصّل الـ Nodes:

```
Webhook → Get Brand → Create Contact → Insert Message → Respond
```

#### 8. فعّل الـ Workflow

اضغط **Active** في أعلى اليمين.

---

## 🧪 اختبار الـ Inbound:

### استخدم الـ script ده:

```bash
node test-inbound-message.js
```

**المفروض تشوف:**
```
✅ Message inserted!
🎉 Success! Check your UI - the message should appear!
```

**افتح الـ UI:**
👉 http://localhost:5177/

**المفروض تلاقي:**
- Contact جديد اسمه "Test Customer"
- رسالة: "Hello! This is a test message from WhatsApp"

---

## 📤 Part 2: Outbound Messages (UI → WhatsApp)

### الخطوات:

#### 1. Setup Supabase Webhook

**افتح:**
```
https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/database/webhooks
```

**اضغط:** "Create a new hook"

**املأ:**
- **Name:** `send-whatsapp-message`
- **Table:** `messages`
- **Events:** `INSERT`
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://your-n8n.com/webhook/whatsapp-outbound`
- **HTTP Headers:**
```json
{
  "Content-Type": "application/json"
}
```
- **Conditions:**
```sql
direction = 'outbound'
```

**احفظ!**

#### 2. عمل n8n Workflow جديد

**اسمه:** "WhatsApp Outbound"

#### 3. ضيف Webhook Node

- **HTTP Method:** POST
- **Path:** `whatsapp-outbound`

#### 4. ضيف Postgres Node (Get Message Data)

- **Operation:** Execute Query
- **Query:**
```sql
SELECT 
  m.*,
  c.wa_id,
  c.name as contact_name,
  b.phone_number_id
FROM messages m
JOIN contacts c ON m.contact_id = c.id
JOIN brands b ON m.brand_id = b.id
WHERE m.id = '{{ $json.record.id }}'
```

#### 5. ضيف HTTP Request Node (Send to WhatsApp)

- **Method:** POST
- **URL:** 
```
https://graph.facebook.com/v18.0/{{ $json[0].phone_number_id }}/messages
```
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_WHATSAPP_ACCESS_TOKEN`
- **Body:**
```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json[0].wa_id }}",
  "type": "text",
  "text": {
    "body": "{{ $json[0].body }}"
  }
}
```

#### 6. ضيف Postgres Node (Update Status)

- **Operation:** Execute Query
- **Query:**
```sql
UPDATE messages 
SET 
  status = 'delivered',
  wa_message_id = '{{ $json.messages[0].id }}'
WHERE id = '{{ $node["Postgres"].json[0].id }}'
```

#### 7. وصّل الـ Nodes:

```
Webhook → Get Data → Send to WhatsApp → Update Status
```

#### 8. فعّل الـ Workflow

---

## 🎯 الخلاصة:

### Inbound Flow:
```
WhatsApp → n8n Webhook → Get Brand → Create Contact → Insert Message → UI
```

### Outbound Flow:
```
UI → Supabase → Webhook → n8n → WhatsApp API → Update Status
```

---

## ✅ Checklist:

### Inbound:
- [ ] n8n workflow created
- [ ] Webhook URL copied
- [ ] Postgres nodes configured
- [ ] Workflow activated
- [ ] Tested with `node test-inbound-message.js`
- [ ] Message appears in UI

### Outbound:
- [ ] Supabase webhook created
- [ ] Webhook condition set (`direction = 'outbound'`)
- [ ] n8n workflow created
- [ ] WhatsApp API configured
- [ ] Workflow activated
- [ ] Tested from UI

---

## 🔧 Troubleshooting:

### Inbound مش شغال:

**Check:**
1. n8n workflow **Active**?
2. Postgres connection صح?
3. Brand موجود في الـ database?

**Test:**
```bash
node test-inbound-message.js
```

### Outbound مش شغال:

**Check:**
1. Supabase webhook created?
2. Webhook URL صح?
3. n8n workflow **Active**?
4. WhatsApp token صح?

**Test:**
- ابعت رسالة من الـ UI
- شوف Supabase webhook logs
- شوف n8n execution logs

---

## 🎉 Success!

لما كل حاجة تشتغل:
1. ✅ تستقبل رسائل من WhatsApp
2. ✅ الرسائل تظهر في الـ UI فوراً
3. ✅ تبعت رسائل من الـ UI
4. ✅ الرسائل توصل WhatsApp
5. ✅ الـ status يتحدث (✓, ✓✓)

**استمتع بالـ CRM! 🚀**
