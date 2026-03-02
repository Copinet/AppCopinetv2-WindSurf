# 📋 INSTRUÇÕES PARA POPULAR SERVIÇOS NO BANCO

## ⚠️ IMPORTANTE - EXECUTE ESTE SQL AGORA

As categorias estão vazias porque ainda não cadastramos os serviços no banco de dados.

---

## 🔧 COMO EXECUTAR

### **1. Abra o Supabase**
- Acesse: https://supabase.com
- Entre no seu projeto

### **2. Vá no SQL Editor**
- Menu lateral → **SQL Editor**
- Clique em **New Query**

### **3. Copie e Cole o SQL**
- Abra o arquivo: `docs/POPULAR_SERVICOS.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor do Supabase

### **4. Execute**
- Clique em **RUN** (ou pressione Ctrl+Enter)
- Aguarde a confirmação de sucesso

---

## ✅ O QUE SERÁ CRIADO

### **Certidões e Documentos** (3 serviços)
- ✅ Certidão de Antecedentes Criminais
- ✅ Certidão de Nascimento (2ª via)
- ✅ Certidão de Casamento (2ª via)

### **Imposto de Renda** (2 serviços)
- ✅ Declaração IR - Simples
- ✅ Declaração IR - Completa

### **Impressão** (3 serviços)
- ✅ Impressão Preto e Branco
- ✅ Impressão Colorida
- ✅ Foto 3x4 Profissional

### **INSS e Benefícios** (2 serviços)
- ✅ Consulta de Benefícios INSS
- ✅ Agendamento no INSS

### **MEI e Empresas** (2 serviços)
- ✅ Abertura de MEI
- ✅ Declaração Anual MEI (DASN-SIMEI)

### **Currículos e Cartas** (2 serviços)
- ✅ Currículo Profissional
- ✅ Carta de Apresentação

---

## 🎯 CARACTERÍSTICAS DOS SERVIÇOS

### **Tipos de Execução:**
- **Fazemos pra Você**: Nós fazemos tudo
- **Faça Você Mesmo**: Cliente faz com desconto de 20%
- **Ambos**: Cliente escolhe

### **Campos Dinâmicos:**
- Cada serviço tem seus próprios campos de formulário
- Validação automática de campos obrigatórios
- Campos específicos por tipo de serviço

### **Preços:**
- Preço base (Fazemos pra Você)
- Preço com desconto (Faça Você Mesmo - 20% OFF)

### **Exemplo Especial - Foto 3x4:**
- ❌ **NÃO** pede dados do cliente
- ✅ Cliente apenas envia a foto
- ✅ Editor faz o trabalho
- ✅ Fluxo simplificado (sem formulário)

---

## 🔍 VERIFICAR SE DEU CERTO

Após executar o SQL, rode esta query para verificar:

```sql
SELECT 
  c.nome as categoria,
  COUNT(s.id) as total_servicos
FROM categorias c
LEFT JOIN servicos s ON s.categoria_id = c.id
GROUP BY c.id, c.nome
ORDER BY c.nome;
```

**Resultado esperado:**
- Certidões e Documentos: 3 serviços
- Currículos e Cartas: 2 serviços
- Impressão: 3 serviços
- Imposto de Renda: 2 serviços
- INSS e Benefícios: 2 serviços
- MEI e Empresas: 2 serviços

---

## 🚀 DEPOIS DE EXECUTAR

1. **Recarregue o app** (F5 no navegador)
2. **Teste a navegação:**
   - Home → Clique em "Certidões" → Deve mostrar 3 serviços
   - Home → Clique em "IR" → Deve mostrar 2 serviços
   - Home → Clique em "Impressão" → Deve mostrar 3 serviços
3. **Teste o fluxo completo:**
   - Escolha um serviço
   - Clique "Solicitar Serviço"
   - Preencha o formulário
   - Vá até o pagamento

---

## 📝 OBSERVAÇÕES

- ✅ Todos os serviços têm formulários dinâmicos
- ✅ Foto 3x4 não tem formulário (apenas upload de foto)
- ✅ Preços com desconto de 20% para "Faça Você Mesmo"
- ✅ Campos validados automaticamente
- ✅ Navegação funcional em toda a Home

---

## ❓ PROBLEMAS?

Se alguma categoria não aparecer:
1. Verifique se as categorias existem no banco
2. Verifique se `ativo = true`
3. Rode a query de verificação acima

---

**Execute o SQL agora e me avise quando terminar!** 🎯
