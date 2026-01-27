#!/bin/bash

# Script rápido para recriar os serviços systemd com usuário correto
# Execute: sudo ./fix-services.sh

if [[ $EUID -ne 0 ]]; then
   echo "Este script deve ser executado como root (use sudo)"
   exit 1
fi

ORIGINAL_USER="${SUDO_USER:-$USER}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_DIR/api"

echo "Debug: PROJECT_DIR = $PROJECT_DIR"
echo "Debug: API_DIR = $API_DIR"

echo "Parando serviços antigos..."
systemctl stop helpdesk-worker helpdesk-reverb

echo "Recriando serviço helpdesk-worker..."
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

echo "Recriando serviço helpdesk-reverb..."
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

echo "Recarregando systemd..."
systemctl daemon-reload

echo "Iniciando serviços..."
systemctl start helpdesk-worker
systemctl start helpdesk-reverb

echo ""
echo "Status dos serviços:"
systemctl status helpdesk-worker --no-pager | head -5
echo ""
systemctl status helpdesk-reverb --no-pager | head -5

echo ""
echo "✓ Serviços recriados com sucesso!"
echo ""
echo "Verifique o status completo com:"
echo "  sudo systemctl status helpdesk-worker"
echo "  sudo systemctl status helpdesk-reverb"
