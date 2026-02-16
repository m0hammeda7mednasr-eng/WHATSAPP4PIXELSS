# 🌙 WhatsApp CRM System

> Production-ready WhatsApp CRM with Shopify integration, interactive messages, and automated order management.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- WhatsApp Business API access
- Shopify store (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS.git
cd WHATSAPP4PIXELSS/wahtsapp-main

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Setup database
# Run COMPLETE-DATABASE-SETUP.sql in Supabase SQL Editor

# Start development
npm run dev:all
```

## 📋 Features

- ✅ **Interactive WhatsApp Messages** - Send messages with action buttons
- ✅ **Shopify Integration** - Automatic order notifications
- ✅ **Multi-tenant Support** - Multiple brands in one system
- ✅ **Automated Reminders** - Follow-up messages after 1 hour
- ✅ **Order Tracking** - Track confirmation status
- ✅ **Customizable Templates** - Brand-specific message templates
- ✅ **Secure** - Environment validation, rate limiting, PII masking
- ✅ **Production Ready** - Error handling, logging, retry logic

## 📁 Project Structure

```
wahtsapp-main/
├── server/                    # Backend server
│   ├── config/               # Configuration
│   ├── controllers/          # Request handlers
│   ├── db/                   # Database client
│   ├── jobs/                 # Background jobs
│   ├── middleware/           # Express middleware
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── utils/                # Utilities
│   └── index.js              # Server entry point
├── src/                      # Frontend (React)
│   ├── components/           # React components
│   ├── config/               # Frontend config
│   ├── context/              # React context
│   └── lib/                  # Libraries
├── docs/                     # Documentation
└── tests/                    # Test files
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required variables.

**Critical variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `WEBHOOK_VERIFY_TOKEN` - Secure token for webhook verification
- `PORT` - Server port (default: 3001)

### Database Setup

Run the SQL script in Supabase:

```sql
-- Run this in Supabase SQL Editor
-- File: COMPLETE-DATABASE-SETUP.sql
```

## 🎯 Usage

### Start All Services

```bash
npm run dev:all
```

This starts:
- Frontend (Vite) on port 5173
- Backend server on port 3001
- Cron job for reminders

### Individual Services

```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server

# Cron job only
npm run dev:cron
```

### Production

```bash
# Build frontend
npm run build

# Start server
npm run server

# Start cron (in separate process)
npm run cron
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture and design
- [API Reference](./API.md) - API endpoints and webhooks
- [Deployment](./DEPLOYMENT.md) - Deployment guide

## 🔐 Security

- ✅ Environment variable validation
- ✅ Rate limiting on all endpoints
- ✅ PII masking in logs
- ✅ Webhook signature verification
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Error handling without data leaks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Mohamed Ahmed Nasr

## 🆘 Support

For issues and questions:
1. Check [Documentation](./docs/)
2. Search [Issues](https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS/issues)
3. Open new issue if needed

---

**Made with ❤️ for better customer communication**
