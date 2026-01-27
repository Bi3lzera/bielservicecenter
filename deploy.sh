#!/bin/bash

# ============================================================================
# Script de Deploy - Biel's Service Center
# ============================================================================
# Este script automatiza o processo de deploy do sistema em produção
# Uso: sudo ./deploy.sh
# ============================================================================

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/api"
APP_DIR="$SCRIPT_DIR/app"

# Funções utilitárias
print_step() {
    echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_error() {
    echo -e "${RED}✗${NC}  $1"
}

print_success() {
    echo -e "${GREEN}✓${NC}  $1"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script deve ser executado como root (use sudo)"
   exit 1
fi

# Obter o usuário original (que executou sudo)
ORIGINAL_USER="${SUDO_USER:-$USER}"
ORIGINAL_HOME=$(eval echo ~$ORIGINAL_USER)

echo -e "${GREEN}"
echo "============================================================================"
echo "  Deploy - Biel's Service Center"
echo "  Sistema de Helpdesk - Produção (IP: 10.7.26.236)"
echo "============================================================================"
echo -e "${NC}"

# ============================================================================
# 1. CONFIGURAR BACKEND (Laravel)
# ============================================================================

print_step "1. Configurando Backend (Laravel)"

cd "$API_DIR"

# Verificar se .env existe
if [ ! -f .env ]; then
    print_warning ".env não encontrado. Copiando de .env.production.example"
    cp .env.production.example .env
    
    echo ""
    print_warning "ATENÇÃO: Configure as seguintes variáveis no .env:"
    echo "  - DB_PASSWORD (senha do MySQL)"
    echo "  - REVERB_APP_SECRET (gere um segredo aleatório)"
    echo ""
    read -p "Pressione ENTER para editar o .env agora..." 
    nano .env
fi

# Gerar APP_KEY se necessário
if grep -q "YOUR_APP_KEY_HERE" .env; then
    print_step "Gerando APP_KEY..."
    php artisan key:generate
    print_success "APP_KEY gerada"
fi

# ============================================================================
# 2. CONFIGURAR BANCO DE DADOS
# ============================================================================

print_step "2. Configurando Banco de Dados MySQL"

# Extrair credenciais do .env
DB_DATABASE=$(grep DB_DATABASE .env | cut -d '=' -f2)
DB_USERNAME=$(grep DB_USERNAME .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

print_warning "Credenciais detectadas:"
echo "  Database: $DB_DATABASE"
echo "  Username: $DB_USERNAME"
echo ""

read -p "Deseja criar o banco de dados agora? (s/n): " create_db

if [[ "$create_db" =~ ^[Ss]$ ]]; then
    print_step "Criando banco de dados..."
    
    read -sp "Digite a senha do root do MySQL: " MYSQL_ROOT_PASSWORD
    echo ""
    
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USERNAME'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_DATABASE.* TO '$DB_USERNAME'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    print_success "Banco de dados criado"
fi

# ============================================================================
# 3. RODAR MIGRATIONS E OTIMIZAR LARAVEL
# ============================================================================

print_step "3. Rodando Migrations e Otimizando Laravel"

php artisan migrate --force
print_success "Migrations executadas"

print_step "Otimizando Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer dump-autoload --optimize
print_success "Laravel otimizado"

# Ajustar permissões
print_step "Ajustando permissões..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
print_success "Permissões ajustadas"

# ============================================================================
# 4. BUILD DO FRONTEND (React)
# ============================================================================

print_step "4. Fazendo Build do Frontend (React)"

cd "$APP_DIR"

# Executar comandos npm como o usuário original (npm está no NVM do usuário)
print_warning "Executando build como usuário: $ORIGINAL_USER"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    print_warning "node_modules não encontrado. Instalando dependências..."
    sudo -u $ORIGINAL_USER bash -c "source $ORIGINAL_HOME/.nvm/nvm.sh && cd '$APP_DIR' && npm install"
fi

print_step "Executando build de produção..."
sudo -u $ORIGINAL_USER bash -c "source $ORIGINAL_HOME/.nvm/nvm.sh && cd '$APP_DIR' && npm run build"
print_success "Build do frontend concluído"

# ============================================================================
# 5. CONFIGURAR NGINX
# ============================================================================

print_step "5. Configurando Nginx"

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    print_error "Nginx não está instalado!"
    echo ""
    read -p "Deseja instalar o Nginx agora? (s/n): " install_nginx
    
    if [[ "$install_nginx" =~ ^[Ss]$ ]]; then
        print_step "Instalando Nginx..."
        apt update
        apt install -y nginx
        print_success "Nginx instalado"
    else
        print_warning "Pulando configuração do Nginx. Configure manualmente depois."
        SKIP_NGINX=true
    fi
fi

if [ "$SKIP_NGINX" != "true" ]; then
    # Criar diretórios se não existirem
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled
    
    if [ ! -f /etc/nginx/sites-available/helpdesk ]; then
        cp "$SCRIPT_DIR/nginx-ip-config.conf" /etc/nginx/sites-available/helpdesk
        ln -sf /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/
        
        # Remover default se existir
        if [ -f /etc/nginx/sites-enabled/default ]; then
            rm /etc/nginx/sites-enabled/default
            print_warning "Configuração default do Nginx removida"
        fi
        
        print_success "Nginx configurado"
    else
        print_warning "Nginx já estava configurado"
    fi
    
    # Testar configuração
    nginx -t
    print_success "Configuração do Nginx válida"
fi

# ============================================================================
# 6. CONFIGURAR SERVIÇOS SYSTEMD
# ============================================================================

print_step "6. Configurando Serviços Systemd"

# Queue Worker Service
print_step "Criando serviço helpdesk-worker..."
cat > /etc/systemd/system/helpdesk-worker.service <<EOF
[Unit]
Description=Helpdesk Queue Worker
After=network.target

[Service]
Type=simple
User=$ORIGINAL_USER
Group=$ORIGINAL_USER
WorkingDirectory=$API_DIR
ExecStart=/usr/bin/php $API_DIR/artisan queue:work --tries=3 --timeout=300
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
print_success "Serviço helpdesk-worker criado"

# Reverb WebSocket Service
print_step "Criando serviço helpdesk-reverb..."
cat > /etc/systemd/system/helpdesk-reverb.service <<EOF
[Unit]
Description=Helpdesk Reverb WebSocket Server
After=network.target

[Service]
Type=simple
User=$ORIGINAL_USER
Group=$ORIGINAL_USER
WorkingDirectory=$API_DIR
ExecStart=/usr/bin/php $API_DIR/artisan reverb:start --host=0.0.0.0 --port=8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
print_success "Serviço helpdesk-reverb criado"

# Recarregar systemd
systemctl daemon-reload

# Habilitar serviços
systemctl enable helpdesk-worker
systemctl enable helpdesk-reverb
print_success "Serviços habilitados para iniciar no boot"

# ============================================================================
# 7. INICIAR/REINICIAR SERVIÇOS
# ============================================================================

print_step "7. Iniciando/Reiniciando Serviços"

systemctl restart helpdesk-worker
systemctl restart helpdesk-reverb

# Reiniciar Nginx e PHP-FPM apenas se estiverem instalados
if [ "$SKIP_NGINX" != "true" ] && command -v nginx &> /dev/null; then
    systemctl restart nginx
fi

if systemctl list-unit-files | grep -q "php8.2-fpm"; then
    systemctl restart php8.2-fpm
elif systemctl list-unit-files | grep -q "php-fpm"; then
    systemctl restart php-fpm
else
    print_warning "PHP-FPM não encontrado, pulando restart"
fi

print_success "Serviços reiniciados"

# ============================================================================
# 8. VERIFICAR STATUS
# ============================================================================

print_step "8. Verificando Status dos Serviços"

echo ""
echo "Status dos serviços:"
echo "-------------------"

services=("nginx" "php8.3-fpm" "helpdesk-worker" "helpdesk-reverb")

for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        print_success "$service está rodando"
    else
        print_error "$service NÃO está rodando"
    fi
done

echo ""
print_step "Verificando portas..."
echo ""
ss -tlnp | grep -E ':(80|8080)' || print_warning "Nenhuma porta aberta detectada"

# ============================================================================
# CONCLUSÃO
# ============================================================================

echo ""
echo -e "${GREEN}"
echo "============================================================================"
echo "  ✓ Deploy Concluído com Sucesso!"
echo "============================================================================"
echo -e "${NC}"
echo ""
echo "URLs de acesso:"
echo "  Frontend: ${GREEN}http://10.7.26.236${NC}"
echo "  API:      ${GREEN}http://10.7.26.236/api${NC}"
echo "  WebSocket: ${GREEN}ws://10.7.26.236:8080${NC}"
echo ""
echo "Comandos úteis:"
echo "  Ver logs:          ${BLUE}sudo journalctl -u helpdesk-reverb -f${NC}"
echo "  Reiniciar tudo:    ${BLUE}sudo systemctl restart helpdesk-worker helpdesk-reverb nginx${NC}"
echo "  Status serviços:   ${BLUE}sudo systemctl status helpdesk-worker helpdesk-reverb${NC}"
echo ""
print_warning "Teste o sistema acessando http://10.7.26.236 pelo navegador"
echo ""
