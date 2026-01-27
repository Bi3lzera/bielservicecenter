# 🚀 Scripts de Deploy - Biel's Service Center

Este diretório contém scripts automatizados para facilitar o deploy e gerenciamento do sistema em produção.

## 📋 Scripts Disponíveis

### 1. **deploy.sh** - Deploy Completo
Script principal que automatiza todo o processo de deploy em produção.

**Uso:**
```bash
sudo ./deploy.sh
```

**O que ele faz:**
1. ✅ Configura o backend Laravel (copia `.env`, gera `APP_KEY`)
2. ✅ Cria e configura banco de dados MySQL
3. ✅ Roda migrations e otimiza Laravel
4. ✅ Faz build do frontend React
5. ✅ Configura Nginx
6. ✅ Cria e habilita serviços systemd (worker + reverb)
7. ✅ Inicia todos os serviços
8. ✅ Verifica status do sistema

**Pré-requisitos:**
- Servidor com IP 10.7.26.236 configurado
- MySQL instalado
- PHP 8.2, Nginx, Node.js instalados
- Executar como root (usar `sudo`)

---

### 2. **scripts/restart-services.sh** - Reiniciar Serviços
Reinicia todos os serviços do helpdesk rapidamente.

**Uso:**
```bash
sudo ./scripts/restart-services.sh
```

**Reinicia:**
- helpdesk-worker (queue)
- helpdesk-reverb (websocket)
- nginx
- php8.2-fpm

---

### 3. **scripts/check-status.sh** - Verificar Status
Verifica o status completo do sistema.

**Uso:**
```bash
sudo ./scripts/check-status.sh
```

**Mostra:**
- ✅ Status de todos os serviços
- ✅ Portas abertas (80, 8080)
- ✅ Conexão com banco de dados
- ✅ Últimos logs do Laravel
- ✅ URLs de acesso
- ✅ Comandos úteis

---

## 🎯 Workflow Recomendado

### Deploy Inicial (primeira vez)

```bash
# 1. Execute o script de deploy
cd /home/biel/biel/helpdesk/helpdesk_sistema
sudo ./deploy.sh

# 2. Durante a execução, você será solicitado a:
#    - Editar o arquivo .env (configurar senha do MySQL)
#    - Criar o banco de dados (senha root do MySQL)

# 3. Após conclusão, acesse:
#    http://10.7.26.236
```

### Atualizações de Código

Quando você fizer alterações no código:

```bash
# 1. Atualizar código backend (Laravel)
cd /home/biel/biel/helpdesk/helpdesk_sistema/api
git pull  # ou suas alterações
php artisan config:cache
php artisan route:cache

# 2. Atualizar frontend (React)
cd /home/biel/biel/helpdesk/helpdesk_sistema/app
git pull  # ou suas alterações
npm run build

# 3. Reiniciar serviços
cd /home/biel/biel/helpdesk/helpdesk_sistema
sudo ./scripts/restart-services.sh
```

### Verificar se está tudo OK

```bash
sudo ./scripts/check-status.sh
```

---

## 📊 Comandos Úteis

```bash
# Ver logs do WebSocket (Reverb)
sudo journalctl -u helpdesk-reverb -f

# Ver logs do Queue Worker
sudo journalctl -u helpdesk-worker -f

# Ver logs do Laravel
tail -f /home/biel/biel/helpdesk/helpdesk_sistema/api/storage/logs/laravel.log

# Limpar cache Laravel
cd /home/biel/biel/helpdesk/helpdesk_sistema/api
php artisan cache:clear
php artisan config:cache

# Parar serviços
sudo systemctl stop helpdesk-worker helpdesk-reverb

# Iniciar serviços
sudo systemctl start helpdesk-worker helpdesk-reverb

# Status individual
sudo systemctl status helpdesk-worker
sudo systemctl status helpdesk-reverb
```

---

## 🔧 Troubleshooting

### Serviço não inicia

```bash
# Ver detalhes do erro
sudo journalctl -u helpdesk-reverb -n 50
sudo journalctl -u helpdesk-worker -n 50

# Verificar permissões
ls -la /home/biel/biel/helpdesk/helpdesk_sistema/api/storage
```

### CORS Errors

Verifique no `.env`:
```bash
FRONTEND_URL=http://10.7.26.236
SANCTUM_STATEFUL_DOMAINS=10.7.26.236
```

### WebSocket não conecta

```bash
# Verificar se a porta 8080 está aberta
sudo netstat -tlnp | grep 8080

# Verificar logs do Reverb
sudo journalctl -u helpdesk-reverb -f
```

### Erro 502 Bad Gateway

```bash
# Verificar PHP-FPM
sudo systemctl status php8.2-fpm

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📁 Estrutura de Arquivos

```
helpdesk_sistema/
├── deploy.sh                    # Script principal de deploy
├── scripts/
│   ├── restart-services.sh      # Reiniciar serviços
│   └── check-status.sh          # Verificar status
├── api/                         # Backend Laravel
├── app/                         # Frontend React
├── nginx-ip-config.conf         # Configuração Nginx
├── DEPLOY-IP.md                 # Documentação detalhada
├── PRODUCTION.md                # Configurações de produção
└── ENVIRONMENT.md               # Variáveis de ambiente
```

---

## 🌐 URLs de Acesso

Após o deploy, o sistema estará disponível em:

- **Frontend**: http://10.7.26.236
- **API**: http://10.7.26.236/api
- **WebSocket**: ws://10.7.26.236:8080

---

## ⚙️ Serviços Systemd

Os seguintes serviços são criados automaticamente:

### helpdesk-worker
- **Descrição**: Processa filas (jobs assíncronos)
- **Comando**: `php artisan queue:work`
- **Auto-restart**: Sim

### helpdesk-reverb
- **Descrição**: Servidor WebSocket para notificações em tempo real
- **Comando**: `php artisan reverb:start`
- **Porta**: 8080
- **Auto-restart**: Sim

Ambos iniciam automaticamente no boot do sistema.

---

## 📝 Notas Importantes

- ⚠️ Sempre execute scripts de deploy/gerenciamento com `sudo`
- ⚠️ Faça backup do banco de dados antes de updates importantes
- ⚠️ Configure senhas fortes no arquivo `.env`
- ⚠️ Este setup é para rede interna (sem SSL/HTTPS)

---

## 🎯 Suporte

Para mais detalhes, consulte:
- [DEPLOY-IP.md](DEPLOY-IP.md) - Guia completo de deploy
- [PRODUCTION.md](PRODUCTION.md) - Configurações de produção
- [ENVIRONMENT.md](ENVIRONMENT.md) - Variáveis de ambiente
