// PM2 Process Configuration for F1 Insights & Morning Brief Portal
const path = require('path');

const NODE_INTERPRETER = process.env.PM2_NODE_INTERPRETER || 'node';
const PYTHON_INTERPRETER = process.env.PM2_PYTHON_INTERPRETER || 'python3';

module.exports = {
  apps: [
    {
      name: 'f1-insights-portal',
      cwd: path.join(__dirname, 'portal'),
      script: 'npm',
      args: 'run dev -- --port 3000 --host',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      out_file: path.join(__dirname, 'logs', 'portal_out.log'),
      error_file: path.join(__dirname, 'logs', 'portal_err.log'),
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'f1-insights-pipeline',
      cwd: path.join(__dirname, 'data_pipeline'),
      script: 'main.py',
      interpreter: PYTHON_INTERPRETER,
      // Run automatically every 6 hours via PM2 cron restart
      cron_restart: '0 */6 * * *',
      autorestart: false,
      watch: false,
      out_file: path.join(__dirname, 'logs', 'pipeline_out.log'),
      error_file: path.join(__dirname, 'logs', 'pipeline_err.log'),
      env: {
        PYTHONUNBUFFERED: '1',
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || ''
      }
    }
  ]
};
