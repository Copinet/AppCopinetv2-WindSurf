# ⚡ COMANDOS RÁPIDOS - COPINET APP

## 🚀 Iniciar o Servidor

### Opção 1: Mesma WiFi (Recomendado)
```bash
npm start
```

### Opção 2: Redes Diferentes (Tunnel)
```bash
npx expo start --tunnel
```

### Opção 3: Limpar Cache
```bash
npx expo start --clear
```

---

## 📱 Como Testar no Celular

1. **Instale o Expo Go:**
   - Android: Google Play Store
   - iOS: App Store

2. **Certifique-se:**
   - Computador e celular na MESMA WiFi
   - Firewall não está bloqueando

3. **Escaneie o QR Code:**
   - Android: Abra Expo Go → Scan QR Code
   - iOS: Câmera nativa → Aponte para QR Code

---

## 🛠️ Comandos Úteis

### Reinstalar Dependências
```bash
npm install
```

### Limpar Cache Completo
```bash
npx expo start --clear
rm -rf node_modules
npm install
npx expo start
```

### Ver Logs Detalhados
```bash
npx expo start --dev-client
```

### Parar Servidor
```
Ctrl + C (no terminal)
```

---

## 📋 CHECKLIST ANTES DE TESTAR

- [ ] Node.js 20 LTS instalado
- [ ] Expo Go instalado no celular
- [ ] Computador e celular na mesma WiFi
- [ ] Firewall permite conexões locais
- [ ] Porta 8081 ou 8082 livre

---

## 🐛 Solução de Problemas

### Erro: "Failed to download remote update"
```bash
npx expo start --tunnel
```

### Erro: "Unable to resolve module"
```bash
npm install
npx expo start --clear
```

### Erro: "Port already in use"
```bash
npx expo start --port 8082
```

### App trava/não carrega
```bash
# Feche Expo Go completamente no celular
# Depois execute:
npx expo start --clear
```

---

## 📞 QUANDO AVISAR QUE ESTÁ PRONTO PARA MÓDULO 2

Teste tudo no checklist do arquivo `docs/TESTE_MODULO_1.md` e me avise:

✅ **"Testei tudo, está funcionando! Pode ir para Módulo 2"**

Aí eu implemento:
- Cadastro de Parceiros
- Painel Admin
- Sistema de Pedidos
- Geolocalização
- Pagamento PIX

---

**Qualquer dúvida, me chame! 🚀**
