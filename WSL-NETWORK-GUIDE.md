# 🌐 Guia: Acessar Servidor WSL pela Rede Interna

## Problema
Você está rodando o servidor no **WSL (Windows Subsystem for Linux)**. O IP `192.168.247.219` é interno do WSL e **NÃO é acessível** de outros computadores da rede.

## Solução: Port Forwarding do Windows

### **Opção 1: Port Forwarding Manual (Recomendado para Produção)**

Execute estes comandos no **PowerShell do Windows como Administrador**:

```powershell
# Descobrir o IP do WSL
wsl hostname -I

# Configurar port forwarding da porta 80 (HTTP)
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=<IP_DO_WSL>

# Configurar port forwarding da porta 8080 (WebSocket)
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<IP_DO_WSL>

# Exemplo (substitua pelo IP real do seu WSL):
# netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=192.168.247.219
# netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=192.168.247.219
```

### **Configurar Firewall do Windows**

No **PowerShell como Administrador**:

```powershell
# Permitir porta 80 (HTTP)
New-NetFirewallRule -DisplayName "WSL Helpdesk HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Permitir porta 8080 (WebSocket)
New-NetFirewallRule -DisplayName "WSL Helpdesk WebSocket" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### **Descobrir IP do Windows na Rede**

No **PowerShell ou CMD**:

```powershell
ipconfig
```

Procure pelo adaptador de rede **Ethernet** ou **Wi-Fi** e anote o **IPv4 Address**. Exemplo: `10.7.26.XXX`

### **Atualizar Frontend e Backend**

Depois de configurar o port forwarding, você precisa atualizar as configurações para usar o **IP do Windows**:

1. **Descubra o IP do Windows na rede** (Ex: `10.7.26.50`)

2. **Atualize o frontend** (`app/.env.production`):
```bash
VITE_API_BASE_URL=http://10.7.26.50/api
VITE_API_AUTH_URL=http://10.7.26.50
VITE_REVERB_HOST=10.7.26.50
```

3. **Rebuild do frontend**:
```bash
cd app
npm run build
```

4. **Atualize o backend** (`api/.env`):
```bash
FRONTEND_URL=http://10.7.26.50
APP_URL=http://10.7.26.50
```

5. **Limpe o cache**:
```bash
cd api
php artisan config:clear
sudo systemctl restart helpdesk-worker helpdesk-reverb
```

---

## **Opção 2: Script Automatizado (WSL 2)**

Se você usa **WSL 2**, crie este script no Windows:

**`wsl-port-forward.ps1`** (PowerShell):

```powershell
# Execute como Administrador

$wslIP = (wsl hostname -I).Trim()
Write-Host "IP do WSL: $wslIP"

# Remover regras antigas
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=8080 listenaddress=0.0.0.0

# Adicionar novas regras
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=$wslIP
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=$wslIP

Write-Host "Port forwarding configurado!"
Write-Host "Porta 80 -> $wslIP:80"
Write-Host "Porta 8080 -> $wslIP:8080"

# Listar regras
netsh interface portproxy show all
```

**Execute sempre que reiniciar o Windows** (o IP do WSL pode mudar).

---

## **Verificar Configuração**

### 1. Listar Port Forwarding Ativo

No **PowerShell do Windows**:

```powershell
netsh interface portproxy show all
```

### 2. Testar Acesso Local

No **navegador do Windows**:
```
http://localhost
```

### 3. Testar da Rede Interna

De **outro computador na rede**:
```
http://10.7.26.XXX
```
(Substitua pelo IP do Windows)

---

## **Remover Port Forwarding (se necessário)**

No **PowerShell como Administrador**:

```powershell
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=8080 listenaddress=0.0.0.0
```

---

## **Opção 3: Modo Bridge (Avançado)**

Se quiser que o WSL tenha um IP real na rede (sem port forwarding), você pode configurar **WSL em modo Bridge**. Isso é mais complexo e requer configuração de rede virtual no Windows.

---

## 📝 **Resumo do Processo**

1. ✅ Execute port forwarding no PowerShell do Windows (como Admin)
2. ✅ Configure firewall do Windows para permitir portas 80 e 8080
3. ✅ Descubra o IP do Windows na rede (`ipconfig`)
4. ✅ Atualize frontend `.env.production` com IP do Windows
5. ✅ Rebuild frontend (`npm run build`)
6. ✅ Atualize backend `.env` com IP do Windows
7. ✅ Teste de outro computador na rede

---

## ⚠️ **Importante**

- O **IP do WSL muda** toda vez que você reinicia o Windows
- Você precisará **executar o script de port forwarding novamente** após cada reinício
- Considere criar uma **tarefa agendada** no Windows para executar automaticamente no boot

---

## 🔗 **Links Úteis**

- [WSL Networking Documentation](https://learn.microsoft.com/en-us/windows/wsl/networking)
- [Port Forwarding WSL 2](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan)
