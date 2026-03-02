# 📘 RESUMO MESTRE V2.0 - COPINET SERVIÇOS DIGITAIS

**Data de Criação:** 26/02/2026  
**Última Atualização:** Sessão atual (quase 1 semana de desenvolvimento)  
**Status:** Módulo 1 completo ✅ | Módulo 2 em andamento 🚧

---

## 🎯 VISÃO GERAL DO PROJETO

### **Nome do Projeto**
**AppCopinetv2** - Copinet Serviços Digitais

### **Objetivo Principal**
Criar um aplicativo nativo multiplataforma (Android, iOS, Web) que seja a **plataforma mais acessível e conveniente** para serviços burocráticos, digitais e de copiadora, especialmente voltado para **pessoas idosas e leigas em tecnologia**.

**Conceito Central:** Marketplace de serviços digitais com 2 lojas próprias em Cubatão/SP + rede de parceiros cadastrados.

### **Público-Alvo**
- **Primário:** Pessoas idosas (60+)
- **Secundário:** Pessoas com baixa familiaridade tecnológica
- **Terciário:** Público geral que busca praticidade

### **Diferenciais**
1. **Máximo 5 cliques** para qualquer serviço (UX ultra-simplificada)
2. **Duas modalidades:** "Fazemos pra Você" (parceiros) + "Faça Você Mesmo" (20% desconto)
3. **Priorização automática** de lojas próprias Copinet
4. **Suporte humano** sempre disponível (WhatsApp + Chat)
5. **Design acessível:** Botões grandes, cores contrastantes, fonte legível
6. **Pagamento único:** Apenas PIX (Mercado Pago)

### **Funcionalidades-Chave**
📋 **Detalhes completos em:** `docs/projeto_completo.txt` (51 páginas, 2287 linhas)

**Categorias de Serviços (40+):**
- Certidões e Documentos (Antecedentes, TSE, Receita Federal, etc.)
- Imposto de Renda (Declaração simples e completa)
- INSS e Benefícios (Consultas, agendamentos, aposentadoria)
- MEI e Empresas (Abertura, DAS, DASN-SIMEI, NFS-e)
- Currículos e Cartas (Criação, atualização, modelos)
- Impressão (P&B, colorida, fotos, 3x4, escaneamento)
- Contratos (Imobiliários, prestação de serviço, orçamentos)
- Trabalhos Escolares e TCC (com IA Gemini)
- DETRAN (CRLV-e, débitos, CNH)
- E mais...

**Fluxos Principais:**
1. **"Fazemos pra Você":** Cliente fornece dados → Parceiro emite documento → PDF entregue (+ impressão opcional)
2. **"Faça Você Mesmo":** Cliente preenche → App gera PDF automaticamente → 20% desconto (+ impressão opcional)

---

## 🏗️ ARQUITETURA E DECISÕES TÉCNICAS

### **Stack Tecnológico**
```
Frontend:
├── React Native (Expo SDK 54)
├── TypeScript (strict mode)
├── Expo Router (file-based routing)
├── StyleSheet nativo (sem TailwindCSS/NativeWind)
└── Ionicons (@expo/vector-icons)

Backend:
├── Supabase (Auth, Database PostgreSQL, Storage, Realtime)
├── Mercado Pago SDK (Pagamentos PIX)
└── Supabase Edge Functions (lógica complexa futura)

Bibliotecas Expo (sem eject):
├── expo-location (geolocalização)
├── expo-camera (captura RG/CNH)
├── expo-web-browser (visualização PDFs)
├── expo-speech-recognition (preenchimento por voz)
├── expo-notifications (push notifications)
└── expo-linking (deep links, WhatsApp, Google Maps)
```

### **Estrutura de Pastas**
```
AppCopinetv2/
├── app/                          # Expo Router (file-based)
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Bottom tabs principais
│   │   ├── home.tsx              ✅ Implementado
│   │   ├── services.tsx          ✅ Implementado
│   │   ├── orders.tsx            ✅ Implementado
│   │   └── profile.tsx           ✅ Implementado
│   ├── categoria/[id].tsx        ✅ Implementado (lista serviços)
│   ├── servico/[id].tsx          ✅ Implementado (detalhes)
│   ├── pedido/
│   │   ├── criar.tsx             ✅ Implementado (formulário)
│   │   ├── pagamento.tsx         ✅ Implementado (PIX)
│   │   ├── confirmado.tsx        ✅ Implementado
│   │   └── detalhes.tsx          ✅ Implementado (timeline)
│   └── _layout.tsx               # Layout raiz
├── lib/
│   └── supabase.ts               # Cliente Supabase configurado
├── types/
│   └── index.ts                  # Tipos TypeScript completos
├── constants/
│   └── Colors.ts                 # Paleta de cores (prata/dourado)
├── supabase/
│   └── schema.sql                # Schema completo do banco ✅
├── docs/                         # Documentação completa
│   ├── projeto_completo.txt      # PDF convertido (51 páginas)
│   ├── PLANO_DESENVOLVIMENTO.md  # Plano 5 fases + checkpoints
│   ├── MODULO_1_COMPLETO.md      # Módulo 1 aprovado
│   ├── MODULO_2_PROGRESSO.md     # Status Módulo 2
│   ├── MODULO_2_INSTRUCOES_BANCO.md
│   ├── POPULAR_SERVICOS.sql      # Script para popular serviços
│   ├── CORRECOES_REALIZADAS.md   # Correções recentes
│   └── [outros arquivos de documentação]
└── package.json                  # Dependências
```

### **Padrões e Convenções**

**Nomenclatura:**
- Arquivos: `kebab-case.tsx` ou `PascalCase.tsx`
- Componentes: `PascalCase`
- Funções: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Tipos: `PascalCase` (interfaces e types)

**Estado e Dados:**
- React Hooks (`useState`, `useEffect`)
- Supabase Realtime para updates automáticos
- Async/await para operações assíncronas
- Try/catch para error handling

**Autenticação:**
- Supabase Auth (email + senha)
- Confirmação obrigatória por email
- Roles: `cliente`, `parceiro`, `admin`
- RLS (Row Level Security) ativo

**Estilo Visual:**
- **Cores:** Prata metálico (#C0C0C0), Dourado (#D4AF37), cores vibrantes por categoria
- **Tipografia:** Fonte grande (16-20px), peso bold em títulos
- **Botões:** Grandes (min 48px altura), bordas arredondadas (12-16px)
- **Sombras:** Elevation/shadowOpacity para efeito 3D
- **Ícones:** Ionicons, tamanho 24-40px
- **Espaçamento:** Padding generoso (16-24px)

**Referências de Implementação:**
- `app/(tabs)/home.tsx` - Padrão visual aprovado
- `app/(tabs)/services.tsx` - Cards e navegação
- `constants/Colors.ts` - Paleta completa

---

## 📊 PROGRESSO ATUAL

### **MÓDULO 1: FUNDAÇÃO** ✅ **100% COMPLETO**
**Status:** Aprovado pelo usuário em 24/02/2026

**Implementado:**
- ✅ Setup Expo SDK 54 + TypeScript
- ✅ Configuração Supabase (projeto: `fuowuvoepioydffjwequ`)
- ✅ Navegação Bottom Tabs (4 telas)
- ✅ Sistema de Autenticação (Login/Cadastro)
- ✅ Email de confirmação obrigatório
- ✅ Logout funcionando (corrigido para web)
- ✅ Telas básicas: Home, Serviços, Pedidos, Perfil

**Detalhes:** `docs/MODULO_1_COMPLETO.md`

---

### **MÓDULO 2: CORE DO MARKETPLACE** 🚧 **70% COMPLETO**
**Status:** Em desenvolvimento ativo

#### **✅ Concluído:**

**1. Banco de Dados Completo**
- ✅ Schema SQL com 9 tabelas (`supabase/schema.sql`)
- ✅ Triggers automáticos (número de pedido, histórico)
- ✅ RLS configurado
- ✅ 8 categorias pré-cadastradas
- ⚠️ **PENDENTE:** Usuário executar SQL no Supabase
- ⚠️ **PENDENTE:** Popular serviços (script pronto em `docs/POPULAR_SERVICOS.sql`)

**Tabelas:**
```sql
categorias          ✅ (8 registros iniciais)
servicos            ⚠️ (aguardando popular)
lojas               ✅ (estrutura pronta)
parceiros           ✅ (estrutura pronta)
pedidos             ✅ (com trigger de número automático)
pedidos_historico   ✅ (trigger automático)
mensagens_suporte   ✅ (estrutura pronta)
configuracoes       ✅ (4 configs iniciais)
notificacoes        ✅ (estrutura pronta)
```

**2. Tipos TypeScript**
- ✅ Todas as interfaces atualizadas (`types/index.ts`)
- ✅ Categoria, Servico, Loja, Parceiro, Pedido, etc.

**3. Telas Implementadas**

**Home (`app/(tabs)/home.tsx`):**
- ✅ Saudação personalizada com nome do usuário
- ✅ Cards "Fazemos pra Você" / "Faça Você Mesmo"
- ✅ Serviços mais usados (4 cards)
- ✅ Botão WhatsApp suporte
- ✅ **CORRIGIDO:** Navegação funcional para categorias

**Serviços (`app/(tabs)/services.tsx`):**
- ✅ Seletor de tipo (Fazemos/Faça Você Mesmo)
- ✅ Badge 20% desconto
- ✅ Lista de categorias coloridas
- ✅ Carregamento do Supabase
- ✅ **CORRIGIDO:** Navegação para lista de serviços

**Pedidos (`app/(tabs)/orders.tsx`):**
- ✅ Lista de pedidos do cliente
- ✅ Filtros (Todos/Em Andamento/Concluídos)
- ✅ Cards coloridos por status
- ✅ Realtime updates (Supabase)
- ✅ Pull-to-refresh
- ✅ Estado vazio

**Lista de Serviços (`app/categoria/[id].tsx`):**
- ✅ Header com cor da categoria
- ✅ Badge de tipo
- ✅ Cards de serviços com preço/desconto
- ✅ Navegação para detalhes

**Detalhes do Serviço (`app/servico/[id].tsx`):**
- ✅ Informações completas
- ✅ Preço destacado
- ✅ Botão "Solicitar Serviço"

**4. Fluxo Completo de Pedidos**

**Criar Pedido (`app/pedido/criar.tsx`):**
- ✅ Formulário dinâmico baseado em `campos_formulario` (JSONB)
- ✅ Validação de campos obrigatórios
- ✅ Campo de observações
- ✅ Resumo do pedido
- ✅ Navegação para pagamento

**Pagamento PIX (`app/pedido/pagamento.tsx`):**
- ✅ Geração de código PIX (simulado)
- ✅ QR Code (placeholder)
- ✅ Código Pix Copia e Cola
- ✅ Timer de expiração (30 min)
- ✅ Instruções passo a passo
- ✅ **Botão de simulação** (para testes)
- ✅ Realtime updates (redireciona ao confirmar)

**Confirmação (`app/pedido/confirmado.tsx`):**
- ✅ Tela de sucesso
- ✅ Número do pedido
- ✅ Próximos passos
- ✅ Resumo de pagamento
- ✅ Navegação para detalhes

**Detalhes do Pedido (`app/pedido/detalhes.tsx`):**
- ✅ Timeline de status com ícones
- ✅ Histórico completo
- ✅ Informações do pedido
- ✅ Valores detalhados
- ✅ Botão WhatsApp suporte
- ✅ Realtime updates

**5. Integrações**
- ✅ Mercado Pago SDK instalado (`mercadopago@2.12.0`)
- ⏳ Integração real PIX (aguardando credenciais)

#### **⏳ Em Andamento:**

**Problema Atual:**
- ❌ Coluna `tipo_execucao` não existe na tabela `servicos`
- ✅ Script SQL corrigido removendo essa coluna
- ⚠️ Usuário precisa executar SQL corrigido

#### **🔜 Próximos Passos (Módulo 2):**

1. **Popular Banco com Serviços** (URGENTE)
   - Executar `docs/POPULAR_SERVICOS.sql` (corrigido)
   - 14 serviços em 6 categorias
   - Formulários dinâmicos específicos

2. **Sistema de Suporte**
   - Chat interno (Supabase Realtime)
   - Integração WhatsApp configurável
   - Tela de mensagens

3. **Cadastro de Parceiros**
   - Formulário completo (40+ serviços)
   - Upload de documentos
   - Sistema de aprovação (admin)

4. **Geolocalização**
   - Mapa de lojas Copinet
   - Mapa de parceiros próximos
   - Busca por raio (5-15km)
   - Priorização lojas próprias

5. **Painel Admin**
   - Dashboard de pedidos
   - Aprovação de parceiros
   - Gestão de serviços
   - Relatórios básicos

**Detalhes:** `docs/MODULO_2_PROGRESSO.md`, `docs/CORRECOES_REALIZADAS.md`

---

### **MÓDULO 3: SERVIÇOS PRINCIPAIS** 📅 **PLANEJADO**
- Certidões (10 tipos)
- Currículos (5-8 modelos)
- Contratos (imobiliários, prestação serviço)
- Impressão (fotos, 3x4, escaneamento)

### **MÓDULO 4: RECURSOS AVANÇADOS** 📅 **PLANEJADO**
- Trabalhos Escolares + TCC (IA Gemini)
- OCR avançado (RG, CNH, CPF)
- Preenchimento por voz
- Sistema de ranking (0-100)
- Avaliações e reclamações

### **MÓDULO 5: EXPANSÃO** 📅 **PLANEJADO**
- DETRAN, INSS, MEI completos
- Agendamento Poupatempo
- Inscrições (concursos, empregos)
- Otimizações de performance
- Testes com idosos

**Plano completo:** `docs/PLANO_DESENVOLVIMENTO.md`

---

## 🐛 BUGS E LIMITAÇÕES CONHECIDOS

### **Resolvidos Recentemente:**
- ✅ Logout não funcionava na web (substituído `Alert.alert` por `confirm`)
- ✅ Navegação da Home não funcionava (adicionado `router.push`)
- ✅ Categorias sem serviços (criado script SQL para popular)
- ✅ Coluna `tipo_execucao` não existe (removido do SQL)

### **Pendentes:**
- ⚠️ Serviços não aparecem (usuário precisa executar SQL)
- ⚠️ Integração PIX real (aguardando credenciais Mercado Pago)
- ⚠️ Upload de arquivos não implementado
- ⚠️ Geolocalização não implementada
- ⚠️ Chat não implementado

### **Limitações Técnicas:**
- Email de confirmação vem como "Supabase" (customização requer plano pago)
- QR Code PIX é placeholder (aguardando integração real)
- Sem OCR ainda (planejado para Módulo 4)
- Sem IA ainda (planejado para Módulo 4)

---

## 📚 DOCUMENTAÇÕES EXISTENTES

### **Arquivos em `/docs/`:**

1. **`projeto_completo.txt`** (115KB, 2287 linhas)
   - Conversão completa do PDF original (51 páginas)
   - Todos os prompts, fluxos e especificações detalhadas
   - Referência principal do projeto

2. **`PLANO_DESENVOLVIMENTO.md`**
   - Estrutura completa: 5 fases + 4 checkpoints
   - Stack tecnológico aprovado
   - Divisão de comissões
   - Estimativas de tempo

3. **`MODULO_1_COMPLETO.md`**
   - Status de aprovação do Módulo 1
   - Correções aplicadas (logout, autenticação)
   - Instruções sobre email de confirmação
   - Melhorias planejadas para Home

4. **`MODULO_2_PROGRESSO.md`**
   - O que foi implementado no Módulo 2
   - Padrão visual mantido
   - Próximos passos detalhados
   - Como testar

5. **`MODULO_2_INSTRUCOES_BANCO.md`**
   - Passo a passo para executar schema SQL
   - Estrutura de tabelas criadas
   - Checklist de verificação

6. **`POPULAR_SERVICOS.sql`** (14KB)
   - Script para inserir 14 serviços
   - 6 categorias populadas
   - Formulários dinâmicos específicos
   - ⚠️ VERSÃO ANTIGA (tem erro de coluna)

7. **`CORRECOES_REALIZADAS.md`**
   - Problemas corrigidos recentemente
   - Navegação da Home
   - Categorias sem serviços
   - Fluxos específicos por serviço

8. **`INSTRUCOES_POPULAR_SERVICOS.md`**
   - Instruções detalhadas para popular banco
   - O que será criado
   - Como verificar
   - Como testar

9. **`CHECKPOINT_1_INSTRUCOES.md`**
   - Instruções do primeiro checkpoint
   - Como testar no celular
   - QR Code

10. **`TESTE_MODULO_1.md`**
    - Checklist de testes do Módulo 1
    - Casos de uso
    - Validações

11. **`SOLUCAO_FINAL_FUNCIONANDO.md`**
    - Solução para problema de autenticação
    - Configuração Supabase correta

12. **`CORRECAO_ERRO_BABEL.md`**
    - Correção de erro de compilação
    - Configuração Babel

### **PDF Original:**
- **`docs/Projeto.pdf`** (1.1MB)
- 51 páginas com especificações completas
- Convertido para `projeto_completo.txt` para facilitar consulta

---

## ⚙️ REGRAS PERMANENTES E PREFERÊNCIAS DO USUÁRIO

### **Estilo de Código:**
1. **TypeScript strict:** Sempre tipar tudo
2. **Sem TailwindCSS/NativeWind:** Usar StyleSheet nativo
3. **Componentes funcionais:** Hooks, não classes
4. **Async/await:** Preferir sobre Promises
5. **Try/catch:** Sempre em operações assíncronas
6. **Console.log:** Manter para debug (remover em produção)

### **UX/UI:**
1. **Botões grandes:** Mínimo 48px altura
2. **Fonte grande:** 16-20px para texto, 24-32px para títulos
3. **Cores contrastantes:** Facilitar leitura
4. **Máximo 5 cliques:** Para qualquer serviço
5. **Feedback visual:** Loading, sucesso, erro sempre visíveis
6. **Textos simples:** Evitar jargões técnicos

### **Fluxos:**
1. **Foto 3x4:** SEM formulário (apenas upload)
2. **Certidões:** Campos específicos (CPF, nome mãe, etc.)
3. **Priorizar lojas próprias:** Sempre que disponíveis
4. **20% desconto:** "Faça Você Mesmo" sempre
5. **PIX único:** Não implementar cartão

### **Desenvolvimento:**
1. **Checkpoints:** Parar para testes após cada fase
2. **Documentar tudo:** Criar .md para cada decisão importante
3. **Commits frequentes:** (quando aplicável)
4. **Testar na web primeiro:** Depois mobile
5. **Ritmo flexível:** Trabalho em sessões

### **O que EVITAR:**
- ❌ Eject do Expo
- ❌ Bibliotecas nativas que requerem eject
- ❌ TailwindCSS/NativeWind
- ❌ Pagamentos com cartão
- ❌ Complexidade desnecessária
- ❌ Jargões técnicos na UI
- ❌ Botões pequenos
- ❌ Muitos cliques para completar ação

---

## 🚀 PRÓXIMOS PASSOS PRIORITÁRIOS

### **URGENTE (Bloqueando Progresso):**
1. ✅ **Corrigir SQL de serviços** (remover `tipo_execucao`)
2. ⚠️ **Usuário executar SQL corrigido** no Supabase
3. ⚠️ **Testar navegação completa** Home → Categoria → Serviço → Pedido

### **Curto Prazo (Esta Semana):**
1. Sistema de Suporte (Chat + WhatsApp)
2. Cadastro de Parceiros (formulário básico)
3. Geolocalização (mapa de lojas)
4. Painel Admin (aprovação parceiros)

### **Médio Prazo (Próximas 2 Semanas):**
1. Integração PIX real (Mercado Pago)
2. Upload de arquivos (documentos, fotos)
3. Notificações push
4. Sistema de ranking parceiros

### **Longo Prazo (Próximo Mês):**
1. Módulos de serviços principais (Certidões, Currículos, Contratos)
2. OCR para RG/CNH
3. Preenchimento por voz
4. IA para trabalhos escolares

**Baseado em:** `docs/PLANO_DESENVOLVIMENTO.md` e estado atual

---

## 🔧 COMANDOS ÚTEIS

### **Iniciar Servidor:**
```powershell
# Porta 8083 (atual)
$env:EXPO_NO_DOCTOR="1"; $env:EXPO_NO_TELEMETRY="1"; $env:CI="1"; npx expo start --web --port 8083
```

### **Acessar App:**
```
http://localhost:8083
```

### **Supabase:**
- **Projeto ID:** `fuowuvoepioydffjwequ`
- **URL:** `https://fuowuvoepioydffjwequ.supabase.co`
- **Dashboard:** https://supabase.com/dashboard

### **Estrutura de Arquivos Importantes:**
```
lib/supabase.ts          # Cliente Supabase
types/index.ts           # Tipos TypeScript
constants/Colors.ts      # Paleta de cores
supabase/schema.sql      # Schema do banco
docs/POPULAR_SERVICOS.sql # Popular serviços (CORRIGIR ANTES)
```

---

## 📝 NOTAS FINAIS

### **Contexto da Sessão Atual:**
- Duração: ~1 semana de desenvolvimento
- Módulo 1: Completo e aprovado
- Módulo 2: 70% completo, bloqueado por SQL
- Último problema: Coluna `tipo_execucao` não existe
- Solução: SQL corrigido, aguardando execução pelo usuário

### **Estado do Código:**
- ✅ Compilando sem erros
- ✅ Servidor rodando na porta 8083
- ✅ Navegação funcional
- ⚠️ Banco sem serviços (aguardando SQL)

### **Decisões Importantes Tomadas:**
1. Usar StyleSheet nativo (não TailwindCSS)
2. Expo SDK 54 (não 51 como planejado)
3. Formulários dinâmicos via JSONB
4. Realtime updates via Supabase
5. Simulação de pagamento para testes

---

## ✅ CHECKLIST DE CONTINUIDADE

Ao retomar o projeto (novo chat ou sessão):

- [ ] Ler este Resumo Mestre v2.0
- [ ] Consultar `docs/projeto_completo.txt` para detalhes de fluxos
- [ ] Verificar `docs/MODULO_2_PROGRESSO.md` para status atual
- [ ] Confirmar se SQL foi executado (verificar se serviços aparecem)
- [ ] Testar navegação: Home → Categoria → Serviço → Pedido
- [ ] Verificar servidor rodando (porta 8083)
- [ ] Consultar `docs/CORRECOES_REALIZADAS.md` para problemas resolvidos
- [ ] Atualizar este resumo conforme progresso

---

## 🎯 OBJETIVO IMEDIATO

**Desbloquear Módulo 2:**
1. Usuário executar SQL corrigido
2. Verificar serviços aparecendo nas categorias
3. Testar fluxo completo de criação de pedido
4. Continuar com Sistema de Suporte

---

**Este é o Resumo Mestre v2.0 — pode ser colado em novo chat como contexto inicial. Cascade continuará consultando /docs/, PDF (projeto_completo.txt) e Memories normalmente.**

---

**Última Atualização:** 26/02/2026 às 16:37 (UTC-3)  
**Próxima Revisão:** Após completar Módulo 2  
**Versão:** 2.0
