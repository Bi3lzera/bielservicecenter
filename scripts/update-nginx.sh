#!/bin/bash

# Script para atualizar configuração do Nginx e recarregar

echo "Copiando configuração atualizada do Nginx..."
cp /home/biel/biel/helpdesk/helpdesk_sistema/nginx-ip-config.conf /etc/nginx/sites-available/helpdesk

echo "Testando configuração do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Recarregando Nginx..."
    systemctl reload nginx
    echo "✓ Nginx recarregado com sucesso!"
    
    echo ""
    echo "Testando resposta do servidor..."
    curl -I http://localhost
else
    echo "✗ Erro na configuração do Nginx!"
    exit 1
fi
