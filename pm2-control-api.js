#!/usr/bin/env node

/**
 * PM2 Control API - Simple authenticated service to restart PM2 processes
 *
 * Usage:
 *   node pm2-control-api.js
 *
 * API Endpoints:
 *   POST /restart/:app_name
 *   Headers: Authorization: Bearer <PM2_API_SECRET>
 */

const express = require('express');
const pm2 = require('pm2');
require('dotenv').config();

const app = express();
const PORT = process.env.PM2_API_PORT || 9615;
const API_SECRET = process.env.PM2_API_SECRET;

if (!API_SECRET) {
  console.error('ERROR: PM2_API_SECRET environment variable is not set!');
  console.error('Please add PM2_API_SECRET to your .env file');
  process.exit(1);
}

app.use(express.json());

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  if (token !== API_SECRET) {
    return res.status(403).json({ error: 'Invalid API secret' });
  }

  next();
};

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pm2-control-api' });
});

// Restart PM2 process
app.post('/restart/:app_name', authenticate, (req, res) => {
  const appName = req.params.app_name;

  console.log(`[${new Date().toISOString()}] Restart request for: ${appName}`);

  pm2.connect((err) => {
    if (err) {
      console.error('PM2 connection error:', err);
      return res.status(500).json({ error: 'Failed to connect to PM2', details: err.message });
    }

    pm2.restart(appName, (err, proc) => {
      pm2.disconnect();

      if (err) {
        console.error(`Failed to restart ${appName}:`, err);
        return res.status(500).json({
          error: `Failed to restart ${appName}`,
          details: err.message
        });
      }

      console.log(`[${new Date().toISOString()}] Successfully restarted: ${appName}`);
      res.json({
        success: true,
        message: `Successfully restarted ${appName}`,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// List PM2 processes (authenticated)
app.get('/list', authenticate, (req, res) => {
  pm2.connect((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to connect to PM2', details: err.message });
    }

    pm2.list((err, list) => {
      pm2.disconnect();

      if (err) {
        return res.status(500).json({ error: 'Failed to list processes', details: err.message });
      }

      const processes = list.map(proc => ({
        name: proc.name,
        status: proc.pm2_env.status,
        pid: proc.pid,
        uptime: proc.pm2_env.pm_uptime,
        restarts: proc.pm2_env.restart_time
      }));

      res.json({ processes });
    });
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`PM2 Control API listening on http://127.0.0.1:${PORT}`);
  console.log(`API Secret: ${API_SECRET.substring(0, 8)}...`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health              - Health check (no auth)');
  console.log('  POST /restart/:app_name   - Restart PM2 process (requires auth)');
  console.log('  GET  /list                - List PM2 processes (requires auth)');
  console.log('');
  console.log('Example usage:');
  console.log(`  curl -X POST http://127.0.0.1:${PORT}/restart/x402-gateway \\`);
  console.log(`    -H "Authorization: Bearer ${API_SECRET}"`);
});
