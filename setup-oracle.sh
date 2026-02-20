#!/bin/bash
# =============================================================
#  Setup inicial da VM Oracle Cloud para Master Cheat
#  Uso: bash setup-oracle.sh <URL_DO_REPO_GITHUB>
# =============================================================
set -e

REPO_URL="${1:-}"
if [ -z "$REPO_URL" ]; then
  echo "Uso: bash setup-oracle.sh <URL_DO_REPOSITORIO_GITHUB>"
  echo "Exemplo: bash setup-oracle.sh https://github.com/usuario/master-cheat.git"
  exit 1
fi

echo "=========================================="
echo "  Master Cheat - Setup Oracle Cloud VM"
echo "=========================================="

echo ""
echo "==> Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo ""
echo "==> Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo ""
echo "==> Instalando PM2 e Nginx..."
sudo npm install -g pm2
sudo apt install -y nginx

echo ""
echo "==> Clonando repositório..."
cd /home/$(whoami)
git clone "$REPO_URL" master-cheat
cd master-cheat

echo ""
echo "==> Configurando variáveis de ambiente..."
cat > backend/.env << 'ENVEOF'
MONGODB_URI=mongodb+srv://back:lunnaback@cluster0.hmxntqd.mongodb.net/headtricl?appName=Cluster0
JWT_SECRET=mastercheat_secret_key_2026_xK9mP2vL
PORT=3001
ENVEOF

echo ""
echo "==> Instalando dependências e buildando..."
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..

echo ""
echo "==> Criando admin no banco..."
cd backend && npx ts-node src/seed.ts && cd ..

echo ""
echo "==> Configurando Nginx (reverse proxy no IP público)..."
PUBLIC_IP=$(curl -s ifconfig.me)

sudo tee /etc/nginx/sites-available/master-cheat > /dev/null << NGINXEOF
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/master-cheat /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo "==> Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "==> Liberando porta 80 no firewall da VM..."
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || sudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null

echo ""
echo "=========================================="
echo "  Setup concluído!"
echo "=========================================="
echo ""
echo "  Acesse: http://${PUBLIC_IP}"
echo ""
echo "  Comandos úteis:"
echo "    pm2 status        - ver status"
echo "    pm2 logs          - ver logs em tempo real"
echo "    pm2 restart all   - reiniciar app"
echo "    bash deploy.sh    - re-deploy manual"
echo ""
