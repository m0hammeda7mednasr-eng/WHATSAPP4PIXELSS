# 📡 API Reference

## Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## Authentication

Most endpoints use Supabase authentication. Webhooks use token verification.

---

## Endpoints

### Health Check

Check server status and database connection.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "database": "connected",
  "uptime": 12345.67
}
```

---

### Send Message

Send a message to a WhatsApp contact.

**Endpoint:** `POST /api/messages/send`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "contact_id": "uuid",
  "brand_id": "uuid",
  "message": "Hello, this is a test message",
  "media_url": "https://example.com/image.jpg",
  "message_type": "text"
}
```

**Parameters:**
- `contact_id` (required) - UUID of the contact
- `brand_id` (required) - UUID of the brand
- `message` (required) - Message text (max 4096 chars)
- `media_url` (optional) - URL of media file
- `message_type` (optional) - Type: text, image, video, audio, document (default: text)

**Response:**
```json
{
  "success": true,
  "message_id": "uuid",
  "wa_message_id": "wamid.xxx",
  "mode": "whatsapp_sent"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Contact not found"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `404` - Contact or brand not found
- `500` - Server error
- `502` - WhatsApp API error

---

### Shopify OAuth - Start

Initiate Shopify OAuth flow.

**Endpoint:** `GET /api/shopify/oauth/install`

**Query Parameters:**
- `shop` (required) - Shopify shop domain (e.g., mystore.myshopify.com)
- `brand_id` (required) - UUID of the brand
- `client_id` (required) - Shopify app client ID
- `client_secret` (required) - Shopify app client secret

**Response:**
Redirects to Shopify OAuth page.

---

### Shopify OAuth - Callback

Handle Shopify OAuth callback.

**Endpoint:** `GET /api/shopify/oauth/callback`

**Query Parameters:**
- `code` (required) - Authorization code from Shopify
- `state` (required) - State parameter (base64 encoded)
- `shop` (required) - Shopify shop domain

**Response:**
Redirects to app with success/error parameter.

---

### Shopify Webhook

Receive Shopify webhooks.

**Endpoint:** `POST /api/shopify/webhook`

**Headers:**
```
X-Shopify-Shop-Domain: mystore.myshopify.com
X-Shopify-Topic: orders/create
X-Shopify-Hmac-Sha256: signature
Content-Type: application/json
```

**Request Body:**
Shopify order object (varies by topic)

**Response:**
```json
{
  "success": true
}
```

**Supported Topics:**
- `orders/create` - New order created

---

### WhatsApp Webhook - Verification

Verify WhatsApp webhook.

**Endpoint:** `GET /webhook/whatsapp`

**Query Parameters:**
- `hub.mode` - Should be "subscribe"
- `hub.verify_token` - Verification token
- `hub.challenge` - Challenge string

**Response:**
Returns challenge string if verification succeeds.

---

### WhatsApp Webhook - Receive

Receive WhatsApp messages and events.

**Endpoint:** `POST /webhook/whatsapp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
WhatsApp webhook payload (varies by event type)

**Response:**
```json
{
  "success": true,
  "message_id": "uuid"
}
```

**Supported Events:**
- Text messages
- Image messages
- Video messages
- Audio messages
- Document messages
- Interactive button clicks

---

## Webhooks

### WhatsApp Webhook Setup

1. Go to Meta Developer Console
2. Navigate to WhatsApp > Configuration
3. Set webhook URL: `https://your-domain.com/webhook/whatsapp`
4. Set verify token: (value from WEBHOOK_VERIFY_TOKEN env var)
5. Subscribe to messages

### Shopify Webhook Setup

1. Go to Shopify Admin > Settings > Notifications
2. Create webhook:
   - Event: Order creation
   - Format: JSON
   - URL: `https://your-domain.com/api/shopify/webhook`
   - API version: 2024-01

---

## Rate Limits

### API Endpoints
- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit` - Total requests allowed
  - `X-RateLimit-Remaining` - Requests remaining
  - `X-RateLimit-Reset` - Time when limit resets

### Webhook Endpoints
- **Limit:** 1000 requests per 15 minutes per IP
- More permissive for high-volume webhooks

**Rate Limit Response:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

**Status Code:** `429 Too Many Requests`

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "contact_id",
      "message": "Invalid contact ID"
    }
  ]
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `502` - Bad Gateway (external API error)

### Error Types

**ValidationError:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "body.message",
      "message": "Message too long"
    }
  ]
}
```

**NotFoundError:**
```json
{
  "success": false,
  "error": "Contact not found"
}
```

**ExternalAPIError:**
```json
{
  "success": false,
  "error": "WhatsApp API Error: Invalid phone number"
}
```

---

## Request/Response Headers

### Common Request Headers

```
Content-Type: application/json
User-Agent: YourApp/1.0
```

### Common Response Headers

```
Content-Type: application/json
X-Correlation-ID: uuid
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

**X-Correlation-ID:** Unique ID for request tracking. Include this in support requests.

---

## Examples

### Send Text Message

```bash
curl -X POST http://localhost:3001/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "123e4567-e89b-12d3-a456-426614174000",
    "brand_id": "123e4567-e89b-12d3-a456-426614174001",
    "message": "Hello from API!",
    "message_type": "text"
  }'
```

### Verify WhatsApp Webhook

```bash
curl "http://localhost:3001/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test123"
```

### Check Health

```bash
curl http://localhost:3001/health
```

---

## Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "WhatsApp CRM API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/health"
      }
    },
    {
      "name": "Send Message",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/messages/send",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"contact_id\": \"{{contact_id}}\",\n  \"brand_id\": \"{{brand_id}}\",\n  \"message\": \"Test message\",\n  \"message_type\": \"text\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3001"
    }
  ]
}
```

---

**Last Updated:** 2024
