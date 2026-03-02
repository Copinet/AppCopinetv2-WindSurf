# 🔧 CORREÇÕES - FASE DE TESTES

## ✅ PROBLEMAS IDENTIFICADOS E SOLUÇÕES

### 1. CERTIDÕES E DOCUMENTOS

#### ❌ Problema: Falta Antecedentes Estadual SP
- **Atual:** Só tem Antecedentes Federal
- **Correção:** Adicionar "Antecedentes Criminais Estadual (SP)"
- **Dados:** CPF (validado), Data Nascimento (validado DD/MM/AAAA)

#### ❌ Problema: Tempo estimado irreal (2-3 dias)
- **Atual:** Fixo 2-3 dias
- **Correção:** Calcular dinamicamente:
  - Com parceiros: Média dos parceiros disponíveis
  - Sem média: Máximo 20 minutos
  - Exceções: TJSP (5 dias), IR (3 dias)

#### ❌ Problema: Serviços genéricos não existentes
- **Atual:** 2ª via certidão nascimento aparece
- **Correção:** Remover todos serviços não listados em SERVICOS_PRECOS_REFERENCIA.md

---

### 2. PAGAMENTO PIX

#### ❌ Problema: Processamento indefinido
- **Atual:** Fica processando sem fim
- **Correção:** 
  - Adicionar timeout de 2 segundos na simulação
  - Garantir que realtime subscription funcione
  - Adicionar feedback visual claro

---

### 3. MEI E EMPRESAS

#### ❌ Problema: Tempo estimado irreal
- **Atual:** 2-3 dias
- **Correção:** Máximo 2 horas (média parceiros/lojas Copinet)

#### ❌ Problema: Falta senha Gov.br
- **Correção:** Adicionar:
  - Banner: "⚠️ Necessário Senha Gov.br (nível Prata/Ouro)"
  - Aviso: "Verificação em 2 etapas DESATIVADA"
  - Campo: Senha Gov.br
  - Tutorial opcional: Como desativar verificação 2 etapas

#### ❌ Problema: Validação telefone
- **Atual:** Sem validação
- **Correção:** Formato (XX)XXXXX-XXXX

#### ❌ Problema: Endereços
- **Atual:** Falta opção "mesmo endereço"
- **Correção:** 
  - Endereço Residencial
  - Endereço Comercial
  - Checkbox: "Endereço comercial é o mesmo que residencial"

---

### 4. IMPOSTO DE RENDA

#### ❌ Problema: Dividido em simples/completa
- **Atual:** Duas opções confusas
- **Correção:** 
  - ÚNICO tipo: "Declaração de Imposto de Renda"
  - Aviso: "Fazemos para CLT, Aposentado, Pensionista"
  - Aviso: "NÃO fazemos: Ações, Cripto, FIIs, BDRs, ETFs, Renda Variável"

#### ❌ Problema: Falta senha Gov.br
- **Correção:** 
  - Opção 1: Com Senha Gov.br (mais simples)
  - Opção 2: Sem senha (upload documentos)
  - Mesmo padrão MEI

#### ❌ Problema: Dependentes
- **Atual:** Campo simples
- **Correção:**
  - Sim/Não
  - Se SIM: Múltipla escolha
  - Tipos: Filho(a), Cônjuge, Enteado(a), Pai, Mãe
  - Para cada: Nome, CPF, Data Nasc, Grau Parentesco
  - Avisos por tipo (ex: cônjuge não pode ter trabalhado)

#### ❌ Problema: Falta uploads
- **Correção:** 
  - Botão upload múltiplo
  - Aceitar: PDF, Imagem
  - Preview dos arquivos

#### ❌ Problema: Falta dados bancários
- **Correção:**
  - Banco, Conta, Agência
  - OU Chave PIX (se CPF, dispensa dados bancários)

#### ❌ Problema: Falta campo informações complementares
- **Correção:** Textarea para observações

---

### 5. INSS E BENEFÍCIOS

#### ❌ Problema: Seção não implementada
- **Correção:** Implementar TODOS os serviços:
  - Extrato Pagamento Benefício
  - Requerer Benefício LOAS
  - Simular Aposentadoria
  - Consulta Situação Benefício
  - Requerer Aposentadoria
  - Requerer Pensão por Morte
  - Requerer Auxílio-Doença
  - Prorrogação Benefício
  - Extrato CNIS
  - Cumprir Exigência

**Padrão para todos:**
- Banner: Senha Gov.br necessária
- Campos específicos por serviço
- Upload documentos quando necessário
- Chat aberto após pagamento (alguns)

---

### 6. IMPRESSÃO RÁPIDA

#### ❌ Problema: Não implementada
- **Correção:** Implementar seção completa:

**Impressão Documentos:**
- Upload múltiplo: PDF, Word, JPG
- Conversão automática para PDF
- Contagem automática folhas
- Preview antes pagamento
- Propriedades por arquivo:
  - P&B ou Colorida
  - Papel: Comum/Cartão/Fotográfico
  - Quantidade cópias
  - Páginas específicas (ex: 1-2, 5-10)
- Preços: P&B R$1,00, Color R$1,50
- Campo mensagem/orientações

**Impressão Fotos:**
- Upload múltiplo imagens
- Tamanhos: 10x15, 13x18, 15x21, 21x29
- Preços: R$3, R$5, R$7, R$9
- Papel fotográfico

**Foto 3x4:**
- Tirar selfie (múltiplas, escolher melhor)
- Edição automática: fundo branco, centralizar
- 6 fotos em 10x15
- Preços: JPG R$5, Impressão s/corte R$8, c/corte R$14
- **NÃO requer dados cliente**

---

### 7. BOTÃO HOME - IMPRESSÃO RÁPIDA

#### ❌ Problema: Não existe
- **Correção:**
  - Botão GRANDE na home
  - Texto: "🖨️ IMPRESSÃO RÁPIDA"
  - Subtítulo: "Nosso Carro-Chefe"
  - Posição: Destaque, antes das categorias
  - Cor: Verde (#10B981)

---

## 🎨 DESIGN

✅ **Aprovado:** Cores, visual, aparência estão maravilhosos!

---

## 📝 VALIDAÇÕES NECESSÁRIAS

- **CPF:** Formato XXX.XXX.XXX-XX + validação dígitos
- **Data:** DD/MM/AAAA + validar data válida
- **Telefone:** (XX)XXXXX-XXXX
- **Email:** Validar formato

---

## 🔐 PADRÃO SENHA GOV.BR

**Banner (todos serviços que precisam):**
```
⚠️ Necessário Senha Gov.br
Nível Prata ou Ouro recomendado
Verificação em 2 etapas deve estar DESATIVADA
```

**Tutorial (link "Como desativar?"):**
1. Entre no app Gov.br
2. Faça login
3. Vá em "Segurança e Privacidade"
4. Clique em "Desativar verificação em 2 etapas"

**Orientação:**
"Após o serviço, você pode reativar a verificação em 2 etapas"

---

## ⏱️ CÁLCULO TEMPO ESTIMADO

```javascript
function calcularTempoEstimado(servico, parceiros) {
  // Exceções (sites oficiais)
  if (servico.tipo === 'certidao_tjsp') return 'Até 5 dias';
  if (servico.tipo === 'imposto_renda') return '3 dias';
  
  // Com parceiros disponíveis
  if (parceiros.length > 0) {
    const media = calcularMediaParceiros(parceiros);
    return formatarTempo(media);
  }
  
  // Sem parceiros/média
  if (servico.categoria === 'mei') return 'Até 2 horas';
  return 'Até 20 minutos';
}
```

---

**Data:** 26/02/2026  
**Status:** Pronto para implementação
