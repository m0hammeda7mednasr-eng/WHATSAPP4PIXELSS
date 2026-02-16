# 🔗 n8n Setup Guide - Complete Integration

## 🎯 Overview

You need **TWO** n8n workflows:
1. **Inbound:** WhatsApp → n8n → Supabase → UI
2. **Outbound:** UI → Supabase Webhook → n8n → WhatsApp

---

## 📥 Workflow 1: Inbound Messages (WhatsApp → Supabase)

### Step 1: Create Webhook Node

1. Open n8n
2. Create new workflow: "WhatsApp Inbound"
3. Add **Webhook** node
4. Configure:
   - **HTTP Method:** POST
   - **Path:** `whatsapp-inbound`
   - **Response Mode:** "Using 'Respond to Webhook' Node"

5. Copy the **Production URL**:
   ```
   https://your-n8n.com/webhook/whatsapp-inbound
   ```

### Step 2: Add Function Node (Parse Data)

Add **Function** node and paste this code:

```javascript
// Parse WhatsApp webhook data
const body = $input.item.json.body;

// Extract message data
const entry = body.entry?.[0];
const changes = entry?.changes?.[0];
const value = changes?.value;
const messages = value?.messages?.[0];
const contacts = value?.contacts?.[0];

if (!messages) {
  return { json: { error: 'No message found' } };
}

// Extract fields
const wa_id = messages.from; // Customer's WhatsApp ID
const phone_number_id = value.metadata?.phone_number_id; // Your WhatsApp Phone ID
const message_type = messages.type; // text, image, etc.

// Get message body based on type
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

// Get contact name
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

### Step 3: Add Postgres Node (Get Brand)

Add **Postgres** node:
- **Operation:** Execute Query
- **Query:**
  ```sql
  SELECT id FROM brands 
  WHERE phone_number_id = '{{ $json.phone_number_id }}' 
  LIMIT 1
  ```

**Connection String:**
```
postgresql://postgres.rmpgofswkpjxionzythf:01066184859mM@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### Step 4: Add Postgres Node (Create/Update Contact)

Add **Postgres** node:
- **Operation:** Execute Query
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

### Step 5: Add Postgres Node (Insert Message)

Add **Postgres** node:
- **Operation:** Execute Query
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

### Step 6: Add Respond to Webhook Node

Add **Respond to Webhook** node:
- **Respond With:** JSON
- **Response Body:**
  ```json
  {
    "success": true,
    "message_id": "{{ $json[0].id }}"
  }
  ```

### Step 7: Connect Nodes

```
Webhook → Parse Data → Get Brand → Create Contact → Insert Message → Respond
```

### Step 8: Activate Workflow

Click **Active** toggle in top right.

---

## 📤 Workflow 2: Outbound Messages (Supabase → WhatsApp)

### Step 1: Setup Supabase Webhook

**Go to:**
```
https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/database/webhooks
```

**Click:** "Create a new hook"

**Configure:**
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
- **Conditions (SQL Filter):**
  ```sql
  direction = 'outbound'
  ```

**Click:** "Create webhook"

### Step 2: Create n8n Workflow

1. Create new workflow: "WhatsApp Outbound"
2. Add **Webhook** node
3. Configure:
   - **HTTP Method:** POST
   - **Path:** `whatsapp-outbound`

### Step 3: Add Postgres Node (Get Contact & Brand)

Add **Postgres** node:
- **Operation:** Execute Query
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

### Step 4: Add Function Node (Format for WhatsApp)

Add **Function** node:

```javascript
const message = $input.item.json[0];

// Format for WhatsApp Business API
return {
  json: {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: message.wa_id,
    type: message.message_type,
    text: {
      body: message.body
    }
  }
};
```

### Step 5: Add HTTP Request Node (Send to WhatsApp)

Add **HTTP Request** node:
- **Method:** POST
- **URL:** `https://graph.facebook.com/v18.0/{{ $node["Get Message Data"].json[0].phone_number_id }}/messages`
- **Authentication:** Header Auth
  - **Name:** `Authorization`
  - **Value:** `Bearer YOUR_WHATSAPP_ACCESS_TOKEN`
- **Body Content Type:** JSON
- **Body:** `{{ $json }}`

### Step 6: Add Postgres Node (Update Status)

Add **Postgres** node:
- **Operation:** Execute Query
- **Query:**
  ```sql
  UPDATE messages 
  SET 
    status = 'delivered',
    wa_message_id = '{{ $json.messages[0].id }}'
  WHERE id = '{{ $node["Get Message Data"].json[0].id }}'
  ```

### Step 7: Connect Nodes

```
Webhook → Get Data → Format → Send to WhatsApp → Update Status
```

### Step 8: Activate Workflow

Click **Active** toggle.

---

## 🧪 Testing

### Test Inbound:

**Use this curl command:**
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
              "body": "Test message from WhatsApp"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Test User"
            }
          }]
        }
      }]
    }]
  }'
```

**Check:**
1. n8n execution log
2. Supabase database (new message)
3. UI (message appears)

### Test Outbound:

1. Open UI: http://localhost:5177/
2. Select a contact
3. Send a message
4. Check:
   - Supabase webhook log
   - n8n execution log
   - WhatsApp (message delivered)

---

## 🔧 Troubleshooting

### Inbound not working:

**Check:**
1. n8n webhook URL is correct in WhatsApp webhook config
2. n8n workflow is **Active**
3. Postgres credentials are correct
4. Brand exists with correct `phone_number_id`

**Test:**
```bash
# Check if webhook is accessible
curl https://your-n8n.com/webhook/whatsapp-inbound
```

### Outbound not working:

**Check:**
1. Supabase webhook is created
2. Webhook URL points to n8n
3. Webhook condition: `direction = 'outbound'`
4. n8n workflow is **Active**
5. WhatsApp access token is valid

**Test:**
```sql
-- Check Supabase webhook logs
SELECT * FROM supabase_functions.hooks 
WHERE name = 'send-whatsapp-message';
```

---

## 📋 Checklist

### Inbound Setup:
- [ ] n8n workflow created
- [ ] Webhook node configured
- [ ] Parse function added
- [ ] Postgres nodes added
- [ ] Workflow activated
- [ ] WhatsApp webhook points to n8n
- [ ] Tested with curl

### Outbound Setup:
- [ ] Supabase webhook created
- [ ] Webhook condition set
- [ ] n8n workflow created
- [ ] Postgres nodes added
- [ ] WhatsApp API configured
- [ ] Workflow activated
- [ ] Tested from UI

---

## 🎉 Success!

When everything works:
1. ✅ Receive WhatsApp message
2. ✅ Message appears in UI instantly
3. ✅ Send message from UI
4. ✅ Message delivered to WhatsApp
5. ✅ Status updates in real-time

**Enjoy your Multi-Tenant WhatsApp CRM! 🚀**
