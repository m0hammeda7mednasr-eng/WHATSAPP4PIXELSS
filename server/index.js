/**
 * Main Server Entry Point
 * WhatsApp CRM Backend Server
 */

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { testConnection } from './db/client.js';

// Import routes
import whatsappRoutes from './routes/whatsapp.routes.js';
import shopifyRoutes from './routes/shopify.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: env.cors.allowedOrigins,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.server.nodeEnv,
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/messages', messageRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/webhook/whatsapp', whatsappRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }
    
    // Start listening
    app.listen(env.server.port, () => {
      logger.info('Server started successfully', {
        port: env.server.port,
        environment: env.server.nodeEnv,
        apiUrl: env.urls.api,
      });
      
      console.log('\n✅ Server running');
      console.log(`📍 Health: ${env.urls.api}/health`);
      console.log(`📍 API: ${env.urls.api}/api`);
      console.log(`📍 Webhooks: ${env.urls.api}/webhook`);
      console.log('');
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise,
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
