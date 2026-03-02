# 🗄️ MÓDULO 2 - CONFIGURAÇÃO DO BANCO DE DADOS

## 📋 INSTRUÇÕES PARA EXECUTAR O SCHEMA NO SUPABASE

### **PASSO 1: Acessar o Supabase**

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `fuowuvoepioydffjwequ`

---

### **PASSO 2: Abrir o SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

---

### **PASSO 3: Executar o Schema**

1. Abra o arquivo: `F:\COPINET\APPCopinet\WindSurf\AppCopinetv2\supabase\schema.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **"Run"** (Executar) no canto inferior direito

**⏱️ Tempo estimado:** 10-15 segundos

---

### **PASSO 4: Verificar Criação das Tabelas**

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as seguintes tabelas criadas:
   - ✅ `categorias`
   - ✅ `servicos`
   - ✅ `lojas`
   - ✅ `parceiros`
   - ✅ `pedidos`
   - ✅ `pedidos_historico`
   - ✅ `mensagens_suporte`
   - ✅ `configuracoes`
   - ✅ `notificacoes`

---

## 📊 ESTRUTURA CRIADA

### **1. Categorias de Serviços**
- Armazena as categorias (Certidões, MEI, IR, etc.)
- Tipo: "fazemos_pra_voce" ou "faca_voce_mesmo"
- Já vem com 8 categorias pré-cadastradas

### **2. Serviços**
- Lista completa de serviços disponíveis
- Vinculados a categorias
- Preços, descontos, tempo estimado
- Campos de formulário dinâmicos (JSONB)

### **3. Lojas Copinet**
- Lojas físicas da rede
- Endereço, telefone, WhatsApp
- Geolocalização (latitude/longitude)
- Horários de funcionamento

### **4. Parceiros**
- Cadastro completo de parceiros
- Status: pendente, aprovado, rejeitado, suspenso
- Sistema de ranking (estrelas)
- Geolocalização
- Estatísticas (taxa de conclusão, tempo de resposta)

### **5. Pedidos**
- Pedidos dos clientes
- Status completo do fluxo
- Dados do formulário (JSONB)
- Integração com pagamento PIX
- Arquivos gerados
- Avaliação

### **6. Histórico de Pedidos**
- Rastreamento de todas as mudanças de status
- Automático via trigger

### **7. Mensagens de Suporte**
- Chat interno do app
- Vinculado a pedidos
- Suporta anexos
- Controle de leitura

### **8. Configurações**
- Configurações gerais do sistema
- WhatsApp ativo/inativo
- Chat ativo/inativo
- Chaves do Mercado Pago
- Taxa de desconto

### **9. Notificações**
- Push notifications
- Tipos: pedido, pagamento, suporte, sistema
- Controle de leitura

---

## 🔒 SEGURANÇA (RLS - Row Level Security)

Todas as tabelas têm políticas de segurança configuradas:

- ✅ **Clientes** veem apenas seus próprios pedidos
- ✅ **Parceiros** veem apenas pedidos atribuídos a eles
- ✅ **Categorias e Serviços** são públicos (apenas ativos)
- ✅ **Mensagens** visíveis apenas para participantes
- ✅ **Notificações** privadas por usuário

---

## 🚀 FUNCIONALIDADES AUTOMÁTICAS

### **Triggers Configurados:**

1. **Atualização Automática de `updated_at`**
   - Toda vez que um registro é atualizado, o campo `updated_at` é atualizado automaticamente

2. **Geração de Número de Pedido**
   - Formato: `COP20260225000001`
   - `COP` + `YYYYMMDD` + `Sequencial de 6 dígitos`
   - Exemplo: COP20260225000001, COP20260225000002...

3. **Registro de Histórico de Status**
   - Toda mudança de status do pedido é registrada automaticamente na tabela `pedidos_historico`

---

## 📦 DADOS INICIAIS INCLUÍDOS

### **Configurações Padrão:**
- ✅ Suporte WhatsApp: Ativo (13988813785)
- ✅ Chat interno: Ativo
- ✅ Desconto "Faça Você Mesmo": 20%
- ⚠️ Mercado Pago: Chaves vazias (configurar depois)

### **Categorias Pré-cadastradas:**
1. 📄 Certidões e Documentos (Azul)
2. 💼 MEI e Empresas (Laranja)
3. 💰 Imposto de Renda (Verde)
4. 🛡️ INSS e Benefícios (Roxo)
5. 📰 Currículos (Rosa)
6. 📋 Contratos (Ciano)
7. 🖨️ Impressão (Vermelho)
8. 📸 Foto 3x4 (Verde-água)

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após executar o SQL, verifique:

- [ ] 9 tabelas criadas no Table Editor
- [ ] Tabela `categorias` tem 8 registros
- [ ] Tabela `configuracoes` tem 5 registros
- [ ] Nenhum erro no SQL Editor
- [ ] RLS habilitado em todas as tabelas

---

## 🆘 PROBLEMAS COMUNS

### **Erro: "extension postgis does not exist"**
**Solução:**
1. Vá em **Database** → **Extensions**
2. Procure por `postgis`
3. Clique em **Enable**
4. Execute o SQL novamente

### **Erro: "permission denied"**
**Solução:**
- Certifique-se de estar logado como proprietário do projeto
- Verifique se tem permissões de admin

### **Tabelas não aparecem no Table Editor**
**Solução:**
- Atualize a página (F5)
- Verifique se o SQL foi executado sem erros

---

## 📞 PRÓXIMOS PASSOS

Após executar o SQL com sucesso:

1. ✅ Me avise que o banco foi criado
2. 🚀 Continuarei implementando as telas do app
3. 🎨 Manterei o mesmo padrão visual da Home
4. 🧪 Testaremos tudo junto no final

---

**Execute o SQL agora e me avise quando estiver pronto! 🎯**
