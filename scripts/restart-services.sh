#!/bin/bash

# ============================================================================
# Script para Reiniciar Serviços do Helpdesk
# ============================================================================
# Uso: sudo ./restart-services.sh
# ============================================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Reiniciando serviços do Helpdesk...${NC}\n"

echo "Reiniciando Queue Worker..."
systemctl restart helpdesk-worker

echo "Reiniciando Reverb WebSocket..."
systemctl restart helpdesk-reverb

echo "Reiniciando Nginx..."
systemctl restart nginx

echo "Reiniciando PHP-FPM..."
if systemctl list-unit-files | grep -q "php8.3-fpm"; then
    systemctl restart php8.3-fpm
elif systemctl list-unit-files | grep -q "php8.3-fpm"; then
    systemctl restart php8.3-fpm
elif systemctl list-unit-files | grep -q "php-fpm"; then
    systemctl restart php-fpm
fi

echo -e "\n${GREEN}✓ Todos os serviços reiniciados com sucesso!${NC}\n"

echo "Status dos serviços:"
echo "-------------------"
systemctl status helpdesk-worker --no-pager | head -3
systemctl status helpdesk-reverb --no-pager | head -3
systemctl status nginx --no-pager | head -3
systemctl status php8.3-fpm --no-pager | head -3
