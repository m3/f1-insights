// PM2 Process Configuration for F1 Insights Platform (VPS Deployment)
const path = require('path');
const fs = require('fs');

const venvPython = path.join(__dirname, '.venv', 'bin', 'python');
const PYTHON_INTERPRETER = fs.existsSync(venvPython) ? venvPython : (process.env.PM2_PYTHON_INTERPRETER || 'python3');

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
      name: 'f1-insights-backend',
      cwd: path.join(__dirname, 'backend', 'app'),
      script: 'main.py',
      interpreter: PYTHON_INTERPRETER,
      autorestart: true,
      watch: false,
      out_file: path.join(__dirname, 'logs', 'backend_out.log'),
      error_file: path.join(__dirname, 'logs', 'backend_err.log'),
      env: {
        PORT: 8000,
        PYTHONPATH: path.join(__dirname, 'backend', 'app'),
        PYTHONUNBUFFERED: '1',
        SQLITE_DB_PATH: path.join(__dirname, 'backend', 'data', 'f1_insights.db')
      }
    },
    {
      name: 'f1-insights-pipeline',
      cwd: path.join(__dirname, 'data_pipeline'),
      script: 'main.py',
      interpreter: PYTHON_INTERPRETER,
      cron_restart: '0 */6 * * *',
      autorestart: false,
      watch: false,
      out_file: path.join(__dirname, 'logs', 'pipeline_out.log'),
      error_file: path.join(__dirname, 'logs', 'pipeline_err.log'),
      env: {
        PYTHONPATH: path.join(__dirname, 'backend', 'app'),
        PYTHONUNBUFFERED: '1',
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || ''
      }
    },
    {
      name: 'f1-insights-social-worker',
      cwd: path.join(__dirname, 'data_pipeline'),
      script: 'main.py',
      args: '--mode=social',
      interpreter: PYTHON_INTERPRETER,
      cron_restart: '*/15 * * * *',
      autorestart: false,
      watch: false,
      out_file: path.join(__dirname, 'logs', 'social_out.log'),
      error_file: path.join(__dirname, 'logs', 'social_err.log'),
      env: {
        PYTHONPATH: path.join(__dirname, 'backend', 'app'),
        PYTHONUNBUFFERED: '1'
      }
    }
  ]
};
