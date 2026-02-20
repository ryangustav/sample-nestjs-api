const path = require('path');

module.exports = {
  apps: [
    {
      name: 'master-cheat',
      script: 'backend/dist/main.js',
      cwd: path.resolve(__dirname),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
