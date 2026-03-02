# 🧪 TESTE DO MÓDULO 1 - CHECKLIST COMPLETO

## ✅ O QUE PRECISA SER TESTADO

### **1. Servidor Expo Inicia Corretamente**
- [ ] Comando `npm start` executa sem erros
- [ ] QR Code aparece no terminal
- [ ] Não há erros de compilação

### **2. Conexão com o Celular**
**IMPORTANTE:** Computador e celular devem estar na **MESMA REDE WIFI**

**Passos:**
1. Abra o terminal na pasta do projeto
2. Execute: `npm start`
3. Aguarde o QR Code aparecer
4. No celular, abra o **Expo Go**
5. Escaneie o QR Code

**Se der erro de conexão:**
- Tente: `npx expo start --tunnel`
- Ou conecte via IP local (aparece no terminal)

### **3. Tela de Login Funciona**
- [ ] App abre e mostra tela de Login
- [ ] Campos de Email e Senha aparecem
- [ ] Botão "Entrar" está visível
- [ ] Botão "Cadastre-se" está visível
- [ ] Design está com cores Prata e Dourado

### **4. Criar Nova Conta**
- [ ] Clique em "Cadastre-se"
- [ ] Preencha todos os campos:
  - Nome Completo
  - Email (use um email válido)
  - Telefone
  - Senha (mínimo 6 caracteres)
  - Confirmar Senha
- [ ] Clique em "Criar Conta"
- [ ] Mensagem de sucesso aparece
- [ ] Redireciona para tela de Login

### **5. Fazer Login**
- [ ] Digite o email e senha que você criou
- [ ] Clique em "Entrar"
- [ ] App carrega e vai para tela Home

### **6. Tela Home (Início)**
- [ ] Mensagem de boas-vindas aparece
- [ ] 4 cards de serviços aparecem:
  - 📄 Certidões
  - 📝 Currículos
  - 🖨️ Impressão
  - 📋 Contratos
- [ ] Cards têm borda e estão bem formatados

### **7. Navegação Bottom Tabs**
- [ ] 4 tabs aparecem na parte inferior:
  - 🏠 Início
  - 💼 Serviços
  - 📄 Pedidos
  - 👤 Perfil
- [ ] Ao clicar em cada tab, a tela muda
- [ ] Tab ativa fica dourada (#FFD700)
- [ ] Tabs inativas ficam cinzas

### **8. Tela Serviços**
- [ ] Mostra título "Todos os Serviços"
- [ ] Mostra mensagem "Em breve você terá acesso..."

### **9. Tela Pedidos**
- [ ] Mostra título "Meus Pedidos"
- [ ] Mostra mensagem "Você ainda não tem pedidos"

### **10. Tela Perfil**
- [ ] Mostra título "Meu Perfil"
- [ ] Botão "Sair da Conta" aparece (vermelho)
- [ ] Ao clicar, mostra confirmação
- [ ] Ao confirmar, faz logout e volta para Login

### **11. Logout e Re-login**
- [ ] Após logout, volta para tela de Login
- [ ] Pode fazer login novamente com mesma conta
- [ ] Dados persistem (não precisa criar conta de novo)

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### **Erro: "Failed to download remote update"**
**Causa:** Computador e celular em redes diferentes  
**Solução:**
1. Conecte ambos na mesma WiFi
2. Pare o servidor (Ctrl+C)
3. Execute: `npx expo start --tunnel`

### **Erro: "Unable to resolve module"**
**Solução:**
```bash
npm install
npx expo start --clear
```

### **Erro: "Metro bundler error"**
**Solução:**
```bash
npx expo start --clear
```

### **App trava na tela branca**
**Solução:**
1. Feche o Expo Go completamente
2. Reabra e escaneie novamente
3. Se persistir, execute: `npx expo start --clear`

### **QR Code não aparece**
**Solução:**
1. Verifique se a porta 8081 está livre
2. Ou use: `npx expo start --port 8082`

---

## 📊 RESULTADO DO TESTE

Após testar tudo, me informe:

### ✅ **TUDO FUNCIONOU**
```
"Testei tudo e está 100% funcionando! 
Checklist completo ✅
Pode avançar para MÓDULO 2"
```

### ⚠️ **FUNCIONOU PARCIALMENTE**
```
"Funcionou mas:
- [X] Login OK
- [X] Navegação OK
- [ ] Problema: [descreva aqui]"
```

### ❌ **NÃO FUNCIONOU**
```
"Erro: [descreva o erro]
Print: [tire foto da tela de erro]"
```

---

## 🚀 PRÓXIMO PASSO (MÓDULO 2)

Após validação completa do Módulo 1, vamos implementar:

### **MÓDULO 2 - Marketplace de Parceiros**
1. Cadastro de Parceiros (questionário 40+ serviços)
2. Painel Admin (aprovação/rejeição)
3. Sistema de Pedidos
4. Geolocalização + Priorização Lojas Próprias
5. Integração PIX (Mercado Pago)

**Tempo estimado:** 2-3 sessões de trabalho

---

## 💡 DICAS PARA O TESTE

1. **Teste com calma** - Não pule etapas
2. **Anote os problemas** - Se algo não funcionar, anote
3. **Tire prints** - Facilita para eu corrigir
4. **Teste 2x** - Faça logout e login novamente para confirmar
5. **Navegue entre todas as tabs** - Garanta que tudo funciona

---

**Boa sorte no teste! Estou aguardando seu feedback. 🎯**
