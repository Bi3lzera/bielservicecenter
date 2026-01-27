#!/bin/bash

# ============================================================================
# Script para Verificar Status do Sistema
# ============================================================================
# Uso: sudo ./check-status.sh
# ============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "============================================================================"
echo "  Status do Sistema - Biel's Service Center"
echo "============================================================================"
echo -e "${NC}\n"

# Função para verificar status
check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✓${NC} $service: ${GREEN}RODANDO${NC}"
    else
        echo -e "${RED}✗${NC} $service: ${RED}PARADO${NC}"
    fi
}

echo "Serviços:"
echo "---------"
check_service "nginx"
check_service "php8.3-fpm"
check_service "helpdesk-worker"
check_service "helpdesk-reverb"

echo -e "\nPortas Abertas:"
echo "---------------"
ss -tlnp 2>/dev/null | grep -E ':(80|8080)' | awk '{print $4}' | while read port; do
    echo -e "${GREEN}✓${NC} $port"
done

echo -e "\nConexões de Banco de Dados:"
echo "---------------------------"
cd "$(dirname "$0")/../api"
if php artisan tinker --execute="DB::connection()->getPdo(); echo 'OK';" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓${NC} MySQL: CONECTADO"
else
    echo -e "${RED}✗${NC} MySQL: ERRO DE CONEXÃO"
fi

echo -e "\nÚltimas Linhas do Log (Laravel):"
echo "---------------------------------"
tail -n 5 "$(dirname "$0")/../api/storage/logs/laravel.log" 2>/dev/null || echo "Nenhum log encontrado"

echo -e "\nURLs de Acesso:"
echo "---------------"
echo -e "Frontend:  ${BLUE}http://10.7.26.236${NC}"
echo -e "API:       ${BLUE}http://10.7.26.236/api${NC}"
echo -e "WebSocket: ${BLUE}ws://10.7.26.236:8080${NC}"

echo -e "\nComandos Úteis:"
echo "---------------"
echo "  Ver logs Reverb:    sudo journalctl -u helpdesk-reverb -f"
echo "  Ver logs Worker:    sudo journalctl -u helpdesk-worker -f"
echo "  Ver logs Laravel:   tail -f api/storage/logs/laravel.log"
echo "  Reiniciar serviços: sudo ./restart-services.sh"
echo ""
