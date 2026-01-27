#!/bin/bash

# Script para corrigir permissões de diretórios para permitir acesso do Nginx

echo "Ajustando permissões dos diretórios para permitir acesso do Nginx..."

# Dar permissão de execução (x) para outros em todo o caminho
chmod o+x /home/biel
chmod o+x /home/biel/biel
chmod o+x /home/biel/biel/helpdesk
chmod o+x /home/biel/biel/helpdesk/helpdesk_sistema
chmod o+x /home/biel/biel/helpdesk/helpdesk_sistema/app
chmod o+x /home/biel/biel/helpdesk/helpdesk_sistema/app/dist

# Dar permissão de leitura para os arquivos do dist
chmod -R o+r /home/biel/biel/helpdesk/helpdesk_sistema/app/dist

echo "✓ Permissões ajustadas!"
echo ""
echo "Testando acesso..."
curl -I http://localhost 2>&1 | head -10

echo ""
echo "Se ainda houver erro, verifique os logs:"
echo "  sudo tail -20 /var/log/nginx/error.log"
