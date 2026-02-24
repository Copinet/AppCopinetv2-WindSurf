# 📋 PLANO DE DESENVOLVIMENTO - COPINET SERVIÇOS DIGITAIS

## ✅ DEFINIÇÕES APROVADAS

- **Checkpoints:** Parar para testes após cada fase
- **IA:** Gemini ou API gratuita para trabalhos escolares
- **Lojas Próprias:** Priorizar lojas Copinet quando disponíveis
- **Ritmo:** Flexível, trabalho em sessões conforme disponibilidade

---

## 🎯 ESTRUTURA DO PROJETO (5 FASES + 4 CHECKPOINTS)

### **FASE 1: FUNDAÇÃO** 
**Objetivo:** App básico funcionando com login e navegação

**Entregas:**
- ✅ Setup Expo SDK 51 + TypeScript + NativeWind
- ✅ Configuração Supabase (Auth, Database, Storage)
- ✅ Navegação Bottom Tabs (Home, Serviços, Pedidos, Perfil)
- ✅ Sistema de Autenticação (Login/Cadastro)
- ✅ Sistema de Roles (Cliente, Parceiro, Admin)
- ✅ Onboarding com LGPD e Termos de Uso

**🔍 CHECKPOINT 1:** Gerar QR Code → Testar no celular → Validar login e navegação

---

### **FASE 2: CORE DO MARKETPLACE**
**Objetivo:** Sistema completo de parceiros e pedidos funcionando

**Entregas:**
- ✅ Cadastro de Parceiros (Questionário com 40+ serviços)
- ✅ Painel Admin (Aprovação/Rejeição de parceiros)
- ✅ Tabela de Preços Editável (Admin)
- ✅ Sistema de Pedidos e Direcionamento Inteligente
- ✅ Geolocalização (expo-location)
- ✅ **PRIORIZAÇÃO LOJAS PRÓPRIAS** (Cubatão)
- ✅ Integração Pagamento PIX (Mercado Pago)
- ✅ Divisão Automática de Comissões

**🔍 CHECKPOINT 2:** Testar fluxo completo: Cliente cria pedido → Parceiro aceita → Pagamento → Conclusão

---

### **FASE 3: MÓDULOS DE SERVIÇOS PRINCIPAIS**
**Objetivo:** 4 módulos mais importantes funcionando

**Entregas:**

**1. Módulo Certidões (10 principais):**
- Antecedentes Criminais (SP, Federal)
- TSE (Quitação, Crimes, 2ª Via Título)
- Receita Federal (CPF, Certidão Negativa)
- Fluxo: "Fazemos pra Você" via parceiros

**2. Módulo Currículos:**
- Criar Novo (5-8 modelos)
- Atualizar via OCR
- Importação LinkedIn
- Envio por Email/WhatsApp
- Fluxo: "Cliente Faz Sozinho" + "Fazemos pra Você"

**3. Módulo Contratos:**
- Imobiliários (Locação, Compra/Venda, Recibo, Vistoria)
- Prestação de Serviço (Geral, Diarista, Reforma, Mecânico)
- Orçamentos (6 modelos)
- Declarações (Residência, União Estável, etc)

**4. Módulo Impressão:**
- Impressão Rápida (PDF/Word/Imagens)
- Fotos (10x15, 13x18, 15x21, 21x29)
- Foto 3x4 (com edição automática)
- Escaneamento para PDF

**🔍 CHECKPOINT 3:** Testar cada módulo individualmente → Validar geração de PDFs → Testar impressão

---

### **FASE 4: RECURSOS AVANÇADOS**
**Objetivo:** Funcionalidades que diferenciam o app

**Entregas:**
- ✅ Trabalhos Escolares + TCC (IA Gemini/Gratuita)
- ✅ Chat Integrado (Supabase Realtime)
- ✅ Sistema de Ranking (0-100 pontos)
- ✅ Avaliações e Reclamações
- ✅ Notificações Push
- ✅ Preenchimento por Voz (todos os campos)
- ✅ OCR Avançado (RG, CNH, CPF)

**🔍 CHECKPOINT 4:** Teste integrado completo → Validar IA → Testar chat → Verificar notificações

---

### **FASE 5: EXPANSÃO E POLIMENTO**
**Objetivo:** Completar todos os serviços e otimizar

**Entregas:**
- ✅ Serviços DETRAN (CRLV-e, Débitos, CNH)
- ✅ Serviços INSS (10+ tipos)
- ✅ Serviços MEI (DAS, DASN-SIMEI, NFS-e)
- ✅ Serviços CTPS (Contratos, Seguro Desemprego)
- ✅ Agendamento Poupatempo
- ✅ 2ª Via Contas
- ✅ Email Simples
- ✅ Inscrições (Concursos, Empregos, Vestibulinho)
- ✅ Serviços Customizados
- ✅ Otimizações de Performance
- ✅ Testes de Usabilidade com Idosos
- ✅ Ajustes Finais de UX

**🔍 CHECKPOINT FINAL:** Deploy → Testes em produção → Validação completa

---

## 🔧 STACK TECNOLÓGICO APROVADO

### **Frontend:**
```
- React Native (Expo SDK 51)
- TypeScript
- NativeWind (TailwindCSS)
- Expo Router (navegação)
```

### **Backend:**
```
- Supabase (Auth, Database, Storage, Realtime)
- Mercado Pago (Pagamentos PIX)
- Supabase Edge Functions (lógica complexa)
```

### **Bibliotecas SEGURAS (sem eject):**
```
✅ expo-location (geolocalização)
✅ expo-camera (captura de fotos)
✅ expo-web-browser (visualização PDFs)
✅ expo-speech-recognition (preenchimento por voz)
✅ expo-notifications (push)
✅ expo-linking (deep links, abrir Google Maps)
```

### **IA para Trabalhos:**
```
- Gemini API (Google) - Gratuita até certo limite
- Fallback: Hugging Face (modelos open source)
```

---

## 🏪 PRIORIZAÇÃO LOJAS PRÓPRIAS

### **Regra de Negócio:**
1. Quando cliente solicita serviço com impressão
2. Sistema verifica parceiros disponíveis
3. **SE** Loja Copinet disponível → Prioriza automaticamente
4. **SE NÃO** → Mostra outros parceiros próximos

### **Comissão Lojas Próprias:**
- Valor do parceiro fica 100% com o app
- Exemplo: Serviço R$10 (70% parceiro + 30% app) → Se loja própria: R$10 (100% app)

---

## 💰 DIVISÃO DE COMISSÕES

| Modalidade | Divisão |
|------------|---------|
| Cliente faz sozinho (só PDF) | 100% app |
| Cliente faz sozinho (PDF + Impressão) | 60% app, 40% parceiro impressor |
| Parceiro faz (só PDF) | 60% parceiro, 40% app |
| Parceiro faz (PDF + Impressão mesmo) | 70% parceiro, 30% app |
| Pedido combinado (emissor + impressor) | 40% emissor, 30% impressor, 30% app |

---

## 📊 BANCO DE DADOS (Supabase Schema)

```sql
-- Usuários
users (id, email, role, nome, cpf, telefone, created_at)

-- Parceiros
partners (
  user_id, 
  status (pending/approved/rejected/suspended),
  services[] (array de serviços),
  has_printer (boolean),
  printer_types[] (pb, colorida, fotografica),
  ranking_score (0-100),
  is_online (boolean),
  is_loja_propria (boolean) -- NOVO
)

-- Pedidos
orders (
  id, 
  client_id, 
  partner_id, 
  service_type,
  status (pending/accepted/in_progress/completed/cancelled),
  price,
  commission_split (json),
  created_at
)

-- Tabela de Preços (Admin)
services_pricing (
  service_name,
  pdf_price,
  print_price,
  commission_client_solo,
  commission_partner,
  updated_at
)

-- Avaliações
reviews (
  order_id,
  partner_id,
  rating (1-5),
  comment,
  created_at
)

-- Chat
chat_messages (
  order_id,
  sender_id,
  message,
  attachments[],
  timestamp
)

-- Storage de Documentos
documents_storage (
  order_id,
  file_url,
  type (pdf/image),
  expires_at (3 dias)
)
```

---

## ⏰ ESTIMATIVA DE TEMPO (FLEXÍVEL)

**Ritmo Intenso:** 6-8 semanas  
**Ritmo Médio:** 10-12 semanas (2-3 meses)  
**Ritmo Tranquilo:** 16-20 semanas (4-5 meses)

**IMPORTANTE:** Tempo de calendário, não de trabalho contínuo. Pausas são normais.

---

## 🚀 PRÓXIMO PASSO

**Iniciar FASE 1:** Setup do projeto base

**Aguardando sua confirmação para começar!** ✅
