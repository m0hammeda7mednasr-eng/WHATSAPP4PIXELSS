# 🏢 Multi-Tenant WhatsApp CRM

## ✅ Setup Complete!

Your WhatsApp CRM has been upgraded to **Multi-Tenant** architecture!

---

## 🎯 What's New?

### Multi-Brand Support:
- ✅ Manage multiple WhatsApp numbers (Brands)
- ✅ Each brand has separate contacts
- ✅ Each brand has separate chat history
- ✅ Easy brand switching from UI

### Database Webhook Pattern:
- ✅ Outbound: UI → Supabase → Webhook → n8n → WhatsApp
- ✅ Inbound: WhatsApp → n8n → Supabase → UI (Real-time)
- ✅ No direct API calls from frontend

### Sample Brands:
- 📱 **4 Pixels** (+201234567890)
- 📱 **Lamsa** (+201098765432)

---

## 🚀 Quick Start

### 1. Open the App:
👉 **http://localhost:5177/**

### 2. Login:
- Email: `moh@gmail.com`
- Password: `01066184859`

### 3. Switch Brands:
- Click on the brand dropdown in the sidebar
- Select "4 Pixels" or "Lamsa"
- Contacts list updates automatically!

### 4. Chat:
- Click on a contact
- Type a message
- Press Send
- Message goes to database → Webhook triggers n8n → Sends to WhatsApp

---

## 📊 Database Schema

### brands (WhatsApp Numbers)
```
- id: UUID
- name: "4 Pixels" | "Lamsa"
- phone_number_id: Meta Phone ID
- display_phone_number: "+201234567890"
- is_active: true/false
```

### contacts (Customers per Brand)
```
- id: UUID
- brand_id: FK → brands.id
- wa_id: Customer's WhatsApp ID
- name: Customer name
- last_message_at: Timestamp
- UNIQUE(brand_id, wa_id)
```

### messages (Chat History)
```
- id: UUID
- contact_id: FK → contacts.id
- brand_id: FK → brands.id
- direction: 'inbound' | 'outbound'
- message_type: 'text' | 'image' | 'interactive'
- body: Message content
- status: 'sent' | 'delivered' | 'read' | 'failed'
- wa_message_id: WhatsApp Message ID
```

---

## 🔧 Supabase Webhook Setup (Critical!)

### Step 1: Create Webhook in Supabase

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
- **URL:** `https://your-n8n-instance.com/webhook/send-whatsapp`
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

### Step 2: Test the Webhook

1. Send a message from the UI
2. Check Supabase webhook logs
3. Check n8n execution logs
4. Verify message was sent to WhatsApp

---

## 🔄 n8n Workflows

### Inbound Workflow (WhatsApp → Supabase)

```
┌─────────────────────────────────────┐
│ 1. Webhook (Receive from WhatsApp) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Function (Parse message data)   │
│    - Extract wa_id, brand_id, body │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Supabase (Find or Create Contact│
│    - Query contacts by wa_id       │
│    - Create if not exists          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Supabase (INSERT message)       │
│    - contact_id                    │
│    - brand_id                      │
│    - direction: 'inbound'          │
│    - message_type: 'text'          │
│    - body: message text            │
│    - status: 'delivered'           │
└─────────────────────────────────────┘
```

### Outbound Workflow (Supabase → WhatsApp)

```
┌─────────────────────────────────────┐
│ 1. Webhook (Triggered by Supabase) │
│    - Receives message data         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Supabase (Get contact & brand)  │
│    - Fetch contact.wa_id           │
│    - Fetch brand.phone_number_id   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Function (Format for WhatsApp)  │
│    - Build WhatsApp API payload    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. HTTP Request (WhatsApp API)     │
│    POST to WhatsApp Business API   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Supabase (UPDATE message status)│
│    - status: 'delivered' or 'failed│
└─────────────────────────────────────┘
```

---

## 🎨 Frontend Components

### 1. BrandContext (`src/context/BrandContext.jsx`)
- Manages current brand state
- Provides: `currentBrand`, `brands`, `switchBrand()`

### 2. Layout (`src/components/Layout.jsx`)
- Main container
- Renders: BrandSwitcher, ChatList, ChatWindow

### 3. BrandSwitcher (`src/components/BrandSwitcher.jsx`)
- Dropdown to switch brands
- Shows current brand name and phone

### 4. ChatList (`src/components/ChatList.jsx`)
- Lists contacts filtered by `currentBrand`
- Real-time updates
- Search functionality

### 5. ChatWindow (`src/components/ChatWindow.jsx`)
- Shows messages for selected contact
- Real-time message updates
- Send messages (INSERT to database)
- Message status indicators (✓, ✓✓, ✓✓ blue)

---

## 📱 Features

### ✅ Multi-Tenant:
- Multiple WhatsApp numbers
- Separate contacts per brand
- Separate chat history
- Brand switching

### ✅ Real-time:
- Instant message updates
- Contact list updates
- Status updates

### ✅ Message Types:
- Text messages
- Images
- Interactive buttons
- Documents

### ✅ Status Tracking:
- Sent ✓
- Delivered ✓✓
- Read ✓✓ (blue)
- Failed ⚠️

---

## 🔐 Security

### Row Level Security (RLS):
- ✅ Authenticated users only
- ✅ Proper data isolation
- ✅ Secure file uploads

### Best Practices:
- Use environment variables
- Never expose service_role key
- Use anon key for client
- Implement proper auth

---

## 📚 Files Structure

```
whatsapp-crm-dashboard/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Layout.jsx          (NEW - Main layout)
│   │   ├── BrandSwitcher.jsx   (NEW - Brand dropdown)
│   │   ├── ChatList.jsx        (NEW - Contacts list)
│   │   ├── ChatWindow.jsx      (NEW - Chat interface)
│   │   └── Settings.jsx
│   ├── context/
│   │   └── BrandContext.jsx    (NEW - Brand state)
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx                 (UPDATED)
│   └── index.css
├── database-multi-tenant-setup.sql  (NEW - Full schema)
├── migrate-to-multi-tenant.sql      (NEW - Migration)
├── MULTI-TENANT-GUIDE.md            (NEW - Complete guide)
└── MULTI-TENANT-README.md           (This file)
```

---

## 🎯 Next Steps

### 1. ✅ Setup Supabase Webhook (Critical!)
See "Supabase Webhook Setup" section above

### 2. ✅ Configure n8n Workflows
See "n8n Workflows" section above

### 3. ✅ Test Inbound Messages
- Send a message to your WhatsApp number
- Check if it appears in the UI

### 4. ✅ Test Outbound Messages
- Send a message from the UI
- Check if it's delivered to WhatsApp

### 5. ✅ Add More Brands (Optional)
```sql
INSERT INTO brands (name, phone_number_id, display_phone_number)
VALUES ('Your Brand', 'your_phone_id', '+20XXXXXXXXXX');
```

---

## 🎉 You're Ready!

**Open the app:** http://localhost:5177/

**Switch brands, chat with customers, and enjoy your Multi-Tenant WhatsApp CRM!** 🚀
