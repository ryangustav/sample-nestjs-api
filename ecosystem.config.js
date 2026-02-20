const path = require('path');

module.exports = {
  apps: [
    {
      name: 'master-cheat',
      script: 'start.js',
      cwd: path.resolve(__dirname, 'backend'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: 'mongodb+srv://back:lunnaback@cluster0.hmxntqd.mongodb.net/headtricl?appName=Cluster0',
        JWT_SECRET: 'mastercheat_secret_key_2026_xK9mP2vL',
      },
    },
  ],
};
