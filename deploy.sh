#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "==> Diretório do projeto: $APP_DIR"

echo "==> Atualizando código..."
cd "$APP_DIR"
git fetch origin && git reset --hard origin/main

echo "==> Instalando dependências do backend..."
cd backend && npm ci
if [ -f .env ]; then
  sed -i 's/\r$//' .env
  grep -q 'mongodb' .env || { echo "ERRO: backend/.env sem MONGODB_URI válido"; exit 1; }
fi
npm run build
cd ..

echo "==> Instalando dependências do frontend..."
cd frontend && npm ci
npm run build
cd ..

echo "==> Reiniciando aplicação..."
pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

echo "==> Deploy concluído!"
