# 🚀 Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Git installed
- Supabase account
- WhatsApp Business API access
- Domain name (for production)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS.git
cd WHATSAPP4PIXELSS/wahtsapp-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Server
PORT=3001
NODE_ENV=production

# Webhook
WEBHOOK_VERIFY_TOKEN=your_secure_random_token

# URLs
API_URL=https://api.yourdomain.com
APP_URL=https://yourdomain.com

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Shopify (optional)
SHOPIFY_WEBHOOK_SECRET=your_shopify_secret
```

**Security Notes:**
- Use strong, random tokens
- Never commit `.env` to git
- Use different tokens for dev/staging/production
- Rotate tokens regularly

### 4. Database Setup

Run SQL script in Supabase SQL Editor:

```sql
-- File: COMPLETE-DATABASE-SETUP.sql
-- Copy and paste the entire file
```

---

## Deployment Options

### Option 1: Railway (Recommended)

**Pros:** Easy setup, automatic deployments, free tier available

**Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Go to project settings
   - Add all variables from `.env`

4. **Deploy**
   - Railway automatically builds and deploys
   - Get your deployment URL

5. **Setup Cron Job**
   - Add new service in same project
   - Set start command: `npm run cron`

**Railway Configuration:**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run server",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Option 2: Render

**Pros:** Free tier, easy setup, automatic SSL

**Steps:**

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - Name: whatsapp-crm-api
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm run server`

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from `.env`

4. **Create Cron Job**
   - Click "New +" → "Cron Job"
   - Configure:
     - Name: whatsapp-crm-cron
     - Command: `npm run cron`
     - Schedule: `*/5 * * * *` (every 5 minutes)

---

### Option 3: Heroku

**Pros:** Mature platform, many add-ons

**Steps:**

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create whatsapp-crm-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   # ... add all variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Setup Cron Job**
   - Use Heroku Scheduler add-on
   - Add job: `npm run cron`
   - Frequency: Every 10 minutes

---

### Option 4: VPS (DigitalOcean, AWS, etc.)

**Pros:** Full control, scalable

**Steps:**

1. **Setup Server**
   ```bash
   # SSH into server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   
   # Install PM2
   npm install -g pm2
   ```

2. **Clone and Setup**
   ```bash
   cd /var/www
   git clone https://github.com/m0hammeda7mednasr-eng/WHATSAPP4PIXELSS.git
   cd WHATSAPP4PIXELSS/wahtsapp-main
   npm install
   ```

3. **Configure Environment**
   ```bash
   nano .env
   # Add your variables
   ```

4. **Start with PM2**
   ```bash
   # Start server
   pm2 start server/index.js --name whatsapp-api
   
   # Start cron
   pm2 start server/jobs/reminder.cron.js --name whatsapp-cron
   
   # Save PM2 config
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Setup SSL**
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d api.yourdomain.com
   ```

---

## Frontend Deployment

### Option 1: Netlify (Recommended)

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop `dist` folder
   - Or connect GitHub for auto-deploy

3. **Configure**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

---

## Post-Deployment

### 1. Configure Webhooks

**WhatsApp:**
1. Go to Meta Developer Console
2. WhatsApp > Configuration
3. Webhook URL: `https://api.yourdomain.com/webhook/whatsapp`
4. Verify token: (from WEBHOOK_VERIFY_TOKEN)
5. Subscribe to messages

**Shopify:**
1. Shopify Admin > Settings > Notifications
2. Create webhook:
   - Event: Order creation
   - URL: `https://api.yourdomain.com/api/shopify/webhook`
   - Format: JSON

### 2. Test Deployment

```bash
# Health check
curl https://api.yourdomain.com/health

# Should return:
# {"status":"ok","timestamp":"...","database":"connected"}
```

### 3. Monitor Logs

**Railway/Render:**
- View logs in dashboard

**Heroku:**
```bash
heroku logs --tail
```

**PM2:**
```bash
pm2 logs
```

### 4. Setup Monitoring

**Recommended Tools:**
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [UptimeRobot](https://uptimerobot.com) - Uptime monitoring

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint

  deploy:
    needs: [test, lint]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Add deployment script
```

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use Nginx or cloud load balancer
   - Distribute traffic across multiple instances

2. **Database**
   - Supabase handles scaling automatically
   - Consider read replicas for high traffic

3. **Caching**
   - Add Redis for session management
   - Cache frequently accessed data

### Vertical Scaling

1. **Increase Resources**
   - More CPU/RAM for server
   - Upgrade database plan

2. **Optimize Code**
   - Database query optimization
   - Reduce external API calls
   - Implement caching

---

## Backup & Recovery

### Database Backups

Supabase provides automatic backups:
- Daily backups (retained for 7 days)
- Point-in-time recovery

### Manual Backup

```bash
# Export database
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Restore
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Troubleshooting

### Server Won't Start

1. Check environment variables
2. Verify database connection
3. Check logs for errors

### Webhooks Not Working

1. Verify webhook URL is accessible
2. Check verify token matches
3. Test with curl
4. Check firewall rules

### High Memory Usage

1. Check for memory leaks
2. Restart server
3. Increase server resources
4. Optimize code

---

## Security Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Webhook signatures verified
- [ ] Database RLS enabled
- [ ] Logs don't contain PII
- [ ] Tokens rotated regularly
- [ ] Firewall configured
- [ ] Monitoring enabled

---

**Last Updated:** 2024
