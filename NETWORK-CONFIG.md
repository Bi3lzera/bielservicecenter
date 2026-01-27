# 🎯 Configuração Final - Acesso pela Rede

## ✅ Sistema Configurado Para:

**IP do Windows na Rede**: `10.7.26.208`

---

## 🌐 URLs de Acesso

### Acesso Local (no próprio computador Windows):
- **Frontend**: http://localhost
- **API**: http://localhost/api
- **WebSocket**: ws://localhost:8080

### Acesso pela Rede (de outros computadores):
- **Frontend**: http://10.7.26.208
- **API**: http://10.7.26.208/api
- **WebSocket**: ws://10.7.26.208:8080

---

## 📋 Configurações Aplicadas

### Frontend (`app/.env.production`)
```bash
VITE_API_BASE_URL=http://10.7.26.208/api
VITE_API_AUTH_URL=http://10.7.26.208
VITE_REVERB_HOST=10.7.26.208
```

### Backend (`api/.env`)
```bash
APP_URL=http://10.7.26.208
FRONTEND_URL=http://10.7.26.208
```

### Nginx (`nginx-ip-config.conf`)
```nginx
server_name 10.7.26.208;
```

---

## ⚙️ Port Forwarding WSL → Windows

**IMPORTANTE**: Como você está usando WSL, certifique-se de que o port forwarding está configurado.

### No PowerShell do Windows (como Administrador):

```powershell
# Port forwarding
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=192.168.247.219
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=192.168.247.219

# Firewall
New-NetFirewallRule -DisplayName "WSL Helpdesk HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL Helpdesk WebSocket" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### Verificar Port Forwarding:
```powershell
netsh interface portproxy show all
```

---

## 🔄 Após Reiniciar o Windows

O IP do WSL pode mudar. Você precisará:

1. **Descobrir novo IP do WSL**:
```bash
wsl hostname -I
```

2. **Reconfigurar port forwarding** com o novo IP

**OU** use o script automatizado em [WSL-NETWORK-GUIDE.md](file:///home/biel/biel/helpdesk/helpdesk_sistema/WSL-NETWORK-GUIDE.md)

---

## ✅ Como Testar

### 1. No próprio computador (Windows):
```
http://localhost
```

### 2. De outro computador na rede:
```
http://10.7.26.208
```

### 3. Verificar se backend está respondendo:
```bash
curl http://10.7.26.208/api
```

---

## 🛠️ Troubleshooting

### Não consegue acessar de outros computadores

1. **Verificar port forwarding** (PowerShell como Admin):
```powershell
netsh interface portproxy show all
```

2. **Verificar firewall do Windows**:
   - Verifique se as portas 80 e 8080 estão permitidas

3. **Testar localmente primeiro**:
```
http://localhost
```

### Frontend carrega mas API não funciona

1. **Limpar cache do navegador** (Ctrl+Shift+Del)
2. **Hard refresh** (Ctrl+F5)
3. **Verificar console do navegador** para erros

### WebSocket não conecta

1. Verificar se porta 8080 está aberta:
```powershell
netsh interface portproxy show all | findstr 8080
```

2. Verificar se Reverb está rodando:
```bash
sudo systemctl status helpdesk-reverb
```

---

## 📝 Documentação Adicional

- [WSL-NETWORK-GUIDE.md](file:///home/biel/biel/helpdesk/helpdesk_sistema/WSL-NETWORK-GUIDE.md) - Guia completo de rede WSL
- [walkthrough.md](file:///home/biel/.gemini/antigravity/brain/20475dae-b6cf-461f-8691-96b99e1c77bb/walkthrough.md) - Walkthrough do deploy
- [SCRIPTS-README.md](file:///home/biel/biel/helpdesk/helpdesk_sistema/SCRIPTS-README.md) - Guia dos scripts

---

## 🎉 Pronto!

Agora outros computadores na sua rede podem acessar o sistema em:

# 🌐 http://10.7.26.208
