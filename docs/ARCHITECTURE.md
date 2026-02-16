# 🏗️ System Architecture

## Overview

WhatsApp CRM is a full-stack application that connects Shopify stores with customers via WhatsApp Business API, enabling automated order notifications and interactive customer responses.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                               │  │
│  │  • Chat Interface                                    │  │
│  │  • Template Settings                                 │  │
│  │  • Shopify OAuth                                     │  │
│  │  • Brand Management                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Server (Port 3001)                       │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  Middleware Stack                              │ │  │
│  │  │  • CORS                                        │ │  │
│  │  │  • Rate Limiting                               │ │  │
│  │  │  • Request Logging                             │ │  │
│  │  │  • Error Handling                              │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  Routes                                        │ │  │
│  │  │  • /api/messages                               │ │  │
│  │  │  • /api/shopify                                │ │  │
│  │  │  • /webhook/whatsapp                           │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  WhatsApp Service    │  │  Shopify Service     │        │
│  │  • Send messages     │  │  • OAuth flow        │        │
│  │  • Interactive msgs  │  │  • Webhook verify    │        │
│  │  • Templates         │  │  • Order management  │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase (PostgreSQL)                               │  │
│  │  • brands                                            │  │
│  │  • contacts                                          │  │
│  │  • messages                                          │  │
│  │  • shopify_orders                                    │  │
│  │  • shopify_connections                               │  │
│  │  • message_templates                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  WhatsApp Business   │  │  Shopify             │        │
│  │  API (Meta)          │  │  • Store API         │        │
│  │  • Send messages     │  │  • Webhooks          │        │
│  │  • Receive webhooks  │  │  • OAuth 2.0         │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKGROUND JOBS                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Reminder Cron Job                                   │  │
│  │  • Runs every 5 minutes                              │  │
│  │  • Sends reminders for pending orders > 1 hour      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React + Vite)

**Technology Stack:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- Lucide React (icons)

**Key Components:**
- `ChatWindow` - Message interface
- `TemplateSettings` - Customize message templates
- `ShopifyOAuth` - Shopify integration
- `MessageTemplates` - Template management

### Backend (Node.js + Express)

**Technology Stack:**
- Node.js 18+
- Express 5
- Supabase JS Client
- Zod (validation)

**Architecture Pattern:**
- **MVC-like structure** with separation of concerns
- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic and external API calls
- **Middleware** - Cross-cutting concerns (logging, auth, rate limiting)
- **Utils** - Shared utilities (validation, errors, retry logic)

**Key Features:**
- Environment validation on startup (fail-fast)
- Structured logging with PII masking
- Retry logic with exponential backoff
- Rate limiting per endpoint
- Correlation IDs for request tracking
- Global error handling

### Database (Supabase/PostgreSQL)

**Schema:**

```sql
brands
├── id (uuid, PK)
├── name (text)
├── phone_number_id (text)
├── whatsapp_token (text)
├── shopify_store_url (text)
├── existing_customer_message (text)
├── confirmation_message (text)
├── cancellation_message (text)
└── reminder_message (text)

contacts
├── id (uuid, PK)
├── brand_id (uuid, FK → brands)
├── wa_id (text) - WhatsApp ID
├── name (text)
└── last_message_at (timestamptz)

messages
├── id (uuid, PK)
├── contact_id (uuid, FK → contacts)
├── brand_id (uuid, FK → brands)
├── order_id (uuid, FK → shopify_orders)
├── direction (text) - inbound/outbound
├── message_type (text)
├── body (text)
├── wa_message_id (text)
└── status (text)

shopify_orders
├── id (uuid, PK)
├── brand_id (uuid, FK → brands)
├── contact_id (uuid, FK → contacts)
├── shopify_order_id (text)
├── shopify_order_number (text)
├── confirmation_status (text)
├── reminder_sent (boolean)
└── customer_response (text)

shopify_connections
├── id (uuid, PK)
├── brand_id (uuid, FK → brands)
├── shop_url (text)
├── access_token (text)
├── scope (text)
└── is_active (boolean)
```

**Security:**
- Row Level Security (RLS) enabled
- Policies per brand isolation
- Encrypted connections

### External Services

**WhatsApp Business API:**
- Send text messages
- Send interactive messages with buttons
- Send template messages
- Receive webhooks for incoming messages

**Shopify API:**
- OAuth 2.0 authentication
- Webhook subscriptions (orders/create)
- Order management
- GraphQL API for fulfillments

## Data Flow

### Order Creation Flow

```
1. Customer places order on Shopify
   ↓
2. Shopify sends webhook to /api/shopify/webhook
   ↓
3. Server validates webhook signature
   ↓
4. Extract order details and customer phone
   ↓
5. Find or create contact in database
   ↓
6. Determine if new or existing customer
   ↓
7. Save order to shopify_orders table
   ↓
8. Send WhatsApp message:
   - New customer → Template message (if available)
   - Existing customer → Interactive message with buttons
   ↓
9. Save message to messages table
   ↓
10. Customer clicks button (✅ تأكيد / ❌ إلغاء)
   ↓
11. WhatsApp sends webhook to /webhook/whatsapp
   ↓
12. Server processes button click
   ↓
13. Update order status in database
   ↓
14. Send confirmation/cancellation message
   ↓
15. If no response after 1 hour → Cron job sends reminder
```

### Message Sending Flow

```
1. User sends message from frontend
   ↓
2. POST /api/messages/send
   ↓
3. Validate request (Zod schema)
   ↓
4. Get contact and brand from database
   ↓
5. Call WhatsApp API (with retry logic)
   ↓
6. Save message to database
   ↓
7. Return success response
```

## Security Measures

### Environment Security
- ✅ Validation on startup (Zod)
- ✅ Fail-fast if missing variables
- ✅ No hardcoded credentials

### API Security
- ✅ Rate limiting (100 req/15min for API, 1000 for webhooks)
- ✅ CORS with whitelist
- ✅ Input validation (Zod schemas)
- ✅ Sanitization (XSS prevention)
- ✅ Webhook signature verification

### Data Security
- ✅ PII masking in logs
- ✅ Sensitive field detection
- ✅ Token masking (show first 10 chars only)
- ✅ Phone number masking (show last 4 digits)

### Error Handling
- ✅ Custom error classes
- ✅ Operational vs programmer errors
- ✅ No stack traces in production
- ✅ Correlation IDs for debugging

## Scalability Considerations

### Current Architecture
- Single server instance
- Supabase handles database scaling
- Stateless design (can scale horizontally)

### Future Improvements
- Load balancer for multiple instances
- Redis for session management
- Message queue for webhook processing
- Separate worker processes for cron jobs
- CDN for frontend assets

## Monitoring & Observability

### Logging
- Structured JSON logs
- Log levels (ERROR, WARN, INFO, DEBUG)
- Correlation IDs for request tracking
- PII masking

### Metrics (Future)
- Request rate
- Response time
- Error rate
- External API latency
- Database query performance

### Alerting (Future)
- Error rate threshold
- API downtime
- Database connection issues
- Webhook delivery failures

## Technology Choices

### Why Express?
- Mature ecosystem
- Flexible middleware system
- Good performance
- Easy to understand

### Why Supabase?
- PostgreSQL (reliable, feature-rich)
- Built-in auth and RLS
- Real-time subscriptions
- Easy to use

### Why Zod?
- TypeScript-first
- Runtime validation
- Great error messages
- Type inference

### Why Vite?
- Fast HMR
- Modern build tool
- Great DX
- Optimized production builds

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (Netlify/Vercel)              │
│  • Static files                         │
│  • CDN distribution                     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Backend (Railway/Render/Heroku)        │
│  • Express server                       │
│  • Cron job                             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Database (Supabase)                    │
│  • PostgreSQL                           │
│  • Managed service                      │
└─────────────────────────────────────────┘
```

---

**Last Updated:** 2024
