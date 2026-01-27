# Guia de Deploy - IP Interno 10.7.26.236

Sistema interno sem domínio, rodando em HTTP (sem SSL).

## 1. Configurar IP do Servidor

Certifique-se que o servidor tem o IP estático configurado:

```bash
# Ver configuração de rede atual
ip addr show

# O servidor deve estar configurado com IP 10.7.26.236
```

## 2. Preparar Backend (Laravel)

```bash
cd /home/biel/biel/helpdesk/helpdesk_sistema/api

# Copiar configuração de produção
cp .env.production.example .env

# Editar e configurar credenciais MySQL
nano .env
```

**Configurações importantes no .env:**
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=http://10.7.26.236:8000`
- `FRONTEND_URL=http://10.7.26.236`
- `SANCTUM_STATEFUL_DOMAINS=10.7.26.236`
- `DB_DATABASE=helpdesk_production`
- `DB_USERNAME=helpdesk_user`
- `DB_PASSWORD=SUA_SENHA_MYSQL`

```bash
# Gerar chave de aplicação
php artisan key:generate

# Criar database MySQL
mysql -u root -p
```

```sql
CREATE DATABASE helpdesk_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helpdesk_user'@'localhost' IDENTIFIED BY 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON helpdesk_production.* TO 'helpdesk_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Rodar migrations
php artisan migrate --force

# Otimizar Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer dump-autoload --optimize

# Ajustar permissões
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## 3. Preparar Frontend (React)

```bash
cd /home/biel/biel/helpdesk/helpdesk_sistema/app

# A configuração .env.production já está pronta para o IP 10.7.26.236
# Fazer build de produção
npm run build
```

Isso cria a pasta `dist/` com os arquivos otimizados.

## 4. Configurar Nginx

```bash
# Copiar configuração
sudo cp /home/biel/biel/helpdesk/helpdesk_sistema/nginx-ip-config.conf /etc/nginx/sites-available/helpdesk

# Ativar site
sudo ln -s /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/

# Remover configuração default se necessário
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 5. Configurar Serviços Systemd

### Queue Worker

```bash
sudo nano /etc/systemd/system/helpdesk-worker.service
```

```ini
[Unit]
Description=Helpdesk Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/biel/biel/helpdesk/helpdesk_sistema/api
ExecStart=/usr/bin/php /home/biel/biel/helpdesk/helpdesk_sistema/api/artisan queue:work --tries=3 --timeout=300
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### Reverb WebSocket

```bash
sudo nano /etc/systemd/system/helpdesk-reverb.service
```

```ini
[Unit]
Description=Helpdesk Reverb WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/biel/biel/helpdesk/helpdesk_sistema/api
ExecStart=/usr/bin/php /home/biel/biel/helpdesk/helpdesk_sistema/api/artisan reverb:start --host=0.0.0.0 --port=8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### Ativar e Iniciar Serviços

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar para iniciar no boot
sudo systemctl enable helpdesk-worker
sudo systemctl enable helpdesk-reverb

# Iniciar serviços
sudo systemctl start helpdesk-worker
sudo systemctl start helpdesk-reverb
```

## 6. Verificar Serviços

```bash
# Status dos serviços
sudo systemctl status helpdesk-worker
sudo systemctl status helpdesk-reverb
sudo systemctl status nginx
sudo systemctl status php8.2-fpm

# Verificar se portas estão abertas
sudo netstat -tlnp | grep -E ':(80|8080)'
```

## 7. Testar o Sistema

De qualquer computador na rede interna:

1. Abrir navegador em: **http://10.7.26.236**
2. Testar login de funcionário
3. Criar ticket
4. Verificar notificações em tempo real

## 8. Comandos Úteis

```bash
# Reiniciar todos os serviços
sudo systemctl restart helpdesk-worker helpdesk-reverb nginx php8.2-fpm

# Ver logs em tempo real
sudo journalctl -u helpdesk-reverb -f
sudo journalctl -u helpdesk-worker -f
tail -f /home/biel/biel/helpdesk/helpdesk_sistema/api/storage/logs/laravel.log

# Limpar cache Laravel
cd /home/biel/biel/helpdesk/helpdesk_sistema/api
php artisan cache:clear
php artisan config:cache
```

## 9. Firewall (Opcional)

Se usar firewall, liberar portas:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw status
```

## URLs de Acesso

- **Frontend + Backend**: http://10.7.26.236
- **API direta**: http://10.7.26.236/api
- **WebSocket**: ws://10.7.26.236:8080

---

## Troubleshooting

### CORS Errors
- Verificar `FRONTEND_URL=http://10.7.26.236` no backend `.env`
- Verificar `SANCTUM_STATEFUL_DOMAINS=10.7.26.236`

### WebSocket não conecta
- Verificar se Reverb está rodando: `sudo systemctl status helpdesk-reverb`
- Verificar logs: `sudo journalctl -u helpdesk-reverb -f`
- Testar porta: `telnet 10.7.26.236 8080`

### 502 Bad Gateway
- Verificar PHP-FPM: `sudo systemctl status php8.2-fpm`
- Verificar permissões: `ls -la /home/biel/biel/helpdesk/helpdesk_sistema/api/storage`

### Database Connection Error
- Verificar credenciais no `.env`
- Testar conexão: `mysql -u helpdesk_user -p helpdesk_production`
