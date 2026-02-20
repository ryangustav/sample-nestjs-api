const path = require('path');

module.exports = {
  apps: [
    {
      name: 'master-cheat',
      script: 'dist/main.js',
      cwd: path.resolve(__dirname, 'backend'),
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
