module.exports = {
  apps: [
    {
      name: 'pm2-control-api',
      script: './pm2-control-api.js',
      cwd: '/home/appuser/heurist-mesh-x402',
      interpreter: 'node',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      error_file: './logs/pm2-control-api-error.log',
      out_file: './logs/pm2-control-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production'
      },
      merge_logs: true,
      kill_timeout: 5000
    }
  ]
};
