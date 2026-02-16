# 🏢 Multi-Tenant WhatsApp CRM - Complete Guide

## 🎯 System Architecture

### The "Database Webhook" Pattern:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  WhatsApp   │ ──────> │     n8n      │ ──────> │  Supabase   │
│    API      │ Inbound │   Webhook    │ INSERT  │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         │ Realtime
                                                         ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  WhatsApp   │ <────── │     n8n      │ <────── │  Supabase   │
│    API      │ Send    │   Webhook    │ Trigger │   Webhook   │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         ▲
                                                         │ INSERT
                                                         │
                                                   ┌─────────────┐
                                                   │  React UI   │
                                                   └─────────────┘
```

### Flow:

1. **Inbound Messages:**
   - WhatsApp → n8n receives message
   - n8n → INSERT into `messages` table (direction: 'inbound')
   - Supabase Realtime → UI updates instantly

2. **Outbound Messages:**
   - User types in UI → INSERT into `messages` table (direction: 'outbound')
   - Supabase Webhook → Triggers n8n
   - n8n → Sends to WhatsApp API
   - WhatsApp → Sends delivery status back
   - n8n → UPDATE message status in Supabase

---

## 📊 Database Schema

### 1. brands (WhatsApp Numbers)
```sql
- id: UUID (PK)
- name: TEXT (e.g., "4 Pixels")
- phone_number_id: TEXT (Meta Phone ID)
- display_phone_number: TEXT (e.g., "+201234567890")
- is_active: BOOLEAN
- created_at, updated_at: TIMESTAMP
```

### 2. contacts (Customers per Brand)
```sql
- id: UUID (PK)
- brand_id: UUID (FK → brands.id)
- wa_id: TEXT (Customer's WhatsApp ID)
- name: TEXT
- profile_pic_url: TEXT
- last_message_at: TIMESTAMP
- created_at: TIMESTAMP
- UNIQUE(brand_id, wa_id) -- One customer per brand
```

### 3. messages (Chat History)
```sql
- id: UUID (PK)
- contact_id: UUID (FK → contacts.id)
- brand_id: UUID (FK → brands.id)
- direction: TEXT ('inbound' | 'outbound')
- message_type: TEXT ('text' | 'image' | 'interactive' | 'document')
- body: TEXT
- media_url: TEXT
- status: TEXT ('sent' | 'delivered' | 'read' | 'failed')
- wa_message_id: TEXT (WhatsApp Message ID)
- created_at: TIMESTAMP
```

---

## 🎨 Frontend Architecture

### Components:

1. **BrandContext** (`src/context/BrandContext.jsx`)
   - Manages current brand state
   - Provides `currentBrand`, `brands`, `switchBrand()`
   - Used throughout the app

2. **Layout** (`src/components/Layout.jsx`)
   - Main container
   - Renders BrandSwitcher, ChatList, ChatWindow

3. **BrandSwitcher** (`src/components/BrandSwitcher.jsx`)
   - Dropdown to switch between brands
   - Shows current brand name and phone

4. **ChatList** (`src/components/ChatList.jsx`)
   - Lists contacts filtered by `currentBrand`
   - Real-time updates via Supabase
   - Search functionality

5. **ChatWindow** (`src/components/ChatWindow.jsx`)
   - Shows messages for selected contact
   - Real-time message updates
   - Send messages (INSERT to database)
   - Message status indicators

---

## 🔧 Setup Instructions

### 1. Database Setup

Run the SQL script:
```bash
node setup-multi-tenant.js
```

This creates:
- ✅ 3 tables (brands, contacts, messages)
- ✅ RLS policies
- ✅ Indexes for performance
- ✅ Sample data (2 brands, 5 contacts)
- ✅ Trigger to update last_message_at

### 2. Supabase Webhook Setup

**Important:** Set up a webhook in Supabase Dashboard to trigger n8n on outbound messages.

**Steps:**
1. Go to: https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/database/webhooks
2. Click "Create a new hook"
3. Configure:
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
   - **Conditions:** Add filter:
     ```sql
     direction = 'outbound'
     ```

4. Click "Create webhook"

### 3. n8n Workflow Setup

**Inbound Workflow (WhatsApp → Supabase):**
```
Webhook (Receive from WhatsApp)
  ↓
Function (Parse message data)
  ↓
Supabase (INSERT into messages)
  - contact_id: (lookup or create contact)
  - brand_id: (from phone_number_id)
  - direction: 'inbound'
  - message_type: (from WhatsApp)
  - body: (message text)
  - status: 'delivered'
```

**Outbound Workflow (Supabase → WhatsApp):**
```
Webhook (Triggered by Supabase)
  ↓
Function (Format for WhatsApp API)
  ↓
HTTP Request (Send to WhatsApp API)
  ↓
Supabase (UPDATE message status)
  - status: 'delivered' or 'failed'
```

---

## 🚀 Usage

### 1. Login
- Email: `moh@gmail.com`
- Password: `01066184859`

### 2. Switch Brand
- Click on brand dropdown in sidebar
- Select "4 Pixels" or "Lamsa"
- Contacts list updates automatically

### 3. Chat
- Click on a contact
- Type message
- Press Send
- Message is inserted into database
- Supabase webhook triggers n8n
- n8n sends to WhatsApp
- Status updates in real-time

---

## 🔐 Security

### Row Level Security (RLS):
- ✅ Authenticated users can read all brands
- ✅ Authenticated users can read/write contacts
- ✅ Authenticated users can read/write messages
- ✅ Each brand's data is logically separated

### Best Practices:
- Use environment variables for sensitive data
- Never expose service_role key in frontend
- Use anon key for client-side operations
- Implement proper authentication

---

## 📱 Features

### ✅ Multi-Tenant:
- Multiple WhatsApp numbers (brands)
- Separate contacts per brand
- Separate chat history per brand
- Easy brand switching

### ✅ Real-time:
- Instant message updates
- Contact list updates
- Status updates (sent/delivered/read)

### ✅ Message Types:
- Text messages
- Images
- Interactive buttons
- Documents (future)

### ✅ Status Tracking:
- Sent ✓
- Delivered ✓✓
- Read ✓✓ (blue)
- Failed ⚠️

---

## 🎯 Next Steps

1. ✅ **Setup Supabase Webhook** (Critical!)
2. ✅ **Configure n8n workflows**
3. ✅ **Test inbound messages**
4. ✅ **Test outbound messages**
5. ✅ **Add more brands** (if needed)

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Check Supabase logs
3. Check n8n execution logs
4. Verify webhook configuration

---

## 🎉 You're Ready!

The Multi-Tenant WhatsApp CRM is now set up and ready to use!

**Open the app:** http://localhost:5177/
