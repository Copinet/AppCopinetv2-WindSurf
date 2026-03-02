-- ============================================
-- SERVIÇOS REAIS - BASEADO EM projeto_completo.txt
-- VERSÃO CORRIGIDA - Deleta pedidos primeiro
-- Data: 27/02/2026
-- ============================================

-- LIMPAR DADOS ANTIGOS NA ORDEM CORRETA
-- 1. Primeiro deletar pedidos (que referenciam serviços)
DELETE FROM pedidos;

-- 2. Depois deletar serviços
DELETE FROM servicos;

-- 3. Por último deletar categorias
DELETE FROM categorias;

-- ============================================
-- CATEGORIA 1: CERTIDÕES E DOCUMENTOS
-- ============================================
INSERT INTO categorias (id, nome, descricao, icone, cor, tipo, ativo, ordem)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Certidões e Documentos',
  'Emissão de certidões e documentos oficiais',
  'document-text',
  '#3B82F6',
  'fazemos_pra_voce',
  true,
  1
);

-- Antecedentes Criminais Federal
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, campos_formulario, ativo, ordem)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Antecedentes Criminais Federal',
  'Certidão de antecedentes da Polícia Federal',
  'Emissão de certidão de antecedentes criminais junto à Polícia Federal. Necessário para concursos, viagens e processos.',
  'shield-checkmark',
  5.00,
  'Até 20 minutos',
  true,
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf", "placeholder": "000.000.000-00"},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data", "placeholder": "DD/MM/AAAA"}
  ]'::jsonb,
  true,
  1
);

-- Antecedentes Criminais Estadual (SP)
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, campos_formulario, ativo, ordem)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Antecedentes Criminais Estadual (SP)',
  'Certidão de antecedentes do Estado de São Paulo',
  'Emissão de certidão de antecedentes criminais junto à SSP-SP.',
  'shield-checkmark',
  5.00,
  'Até 20 minutos',
  true,
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf", "placeholder": "000.000.000-00"},
    {"nome": "rg", "label": "RG", "tipo": "texto", "obrigatorio": true},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data", "placeholder": "DD/MM/AAAA"}
  ]'::jsonb,
  true,
  2
);

-- Certidão de Quitação Eleitoral
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, campos_formulario, ativo, ordem)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Certidão de Quitação Eleitoral',
  'Certidão que comprova regularidade eleitoral',
  'Documento emitido pelo TSE que comprova estar em dia com as obrigações eleitorais.',
  'checkbox',
  5.00,
  'Até 20 minutos',
  true,
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf", "placeholder": "000.000.000-00"},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data", "placeholder": "DD/MM/AAAA"}
  ]'::jsonb,
  true,
  3
);

-- Situação Cadastral CPF
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, campos_formulario, ativo, ordem)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Situação Cadastral CPF',
  'Comprovante de situação do CPF na Receita Federal',
  'Comprovante de situação cadastral do CPF emitido pela Receita Federal.',
  'card',
  5.00,
  'Até 20 minutos',
  true,
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf", "placeholder": "000.000.000-00"},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data", "placeholder": "DD/MM/AAAA"}
  ]'::jsonb,
  true,
  4
);

-- ============================================
-- CATEGORIA 2: MEI E EMPRESAS
-- ============================================
INSERT INTO categorias (id, nome, descricao, icone, cor, tipo, ativo, ordem)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'MEI e Empresas',
  'Serviços para MEI e empresas',
  'briefcase',
  '#8B5CF6',
  'fazemos_pra_voce',
  true,
  2
);

-- Abertura de MEI
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, campos_formulario, ativo, ordem)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Abertura de MEI',
  'Abertura de MEI completa',
  'Realizamos todo o processo de abertura do seu MEI. Necessário senha Gov.br.',
  'business',
  80.00,
  'Até 2 horas',
  true,
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf", "placeholder": "000.000.000-00"},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data", "placeholder": "DD/MM/AAAA"},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true, "placeholder": "(00)00000-0000"},
    {"nome": "endereco_residencial", "label": "Endereço Residencial Completo", "tipo": "textarea", "obrigatorio": true},
    {"nome": "endereco_comercial", "label": "Endereço Comercial Completo", "tipo": "textarea", "obrigatorio": true}
  ]'::jsonb,
  true,
  1
);

-- Emitir DAS Mensal
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, campos_formulario, ativo, ordem)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Emitir DAS Mensal',
  'Emissão do boleto DAS do MEI',
  'Emitimos o boleto DAS mensal do seu MEI para pagamento.',
  'document',
  3.00,
  'Até 20 minutos',
  true,
  true,
  '[
    {"nome": "cnpj", "label": "CNPJ do MEI", "tipo": "texto", "obrigatorio": true, "placeholder": "00.000.000/0000-00"}
  ]'::jsonb,
  true,
  2
);

-- ============================================
-- CATEGORIA 3: IMPRESSÃO
-- ============================================
INSERT INTO categorias (id, nome, descricao, icone, cor, tipo, ativo, ordem)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Impressão',
  'Impressão de documentos e fotos',
  'print',
  '#10B981',
  'faca_voce_mesmo',
  true,
  3
);

-- Impressão de Documentos
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, ativo, ordem)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Impressão de Documentos',
  'Imprima seus documentos PDF, Word, PowerPoint',
  'Faça upload dos seus documentos e escolha as opções de impressão. P&B: R$1,00/pág | Colorido: R$1,50/pág',
  'document',
  1.00,
  'Imediato',
  false,
  true,
  true,
  1
);

-- Impressão de Fotos
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, ativo, ordem)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Impressão de Fotos',
  'Imprima suas fotos em papel fotográfico',
  'Faça upload das suas fotos. 10x15: R$3,00 | 13x18: R$5,00 | 15x21: R$7,00',
  'images',
  3.00,
  'Imediato',
  false,
  true,
  true,
  2
);

-- ============================================
-- CATEGORIA 4: FOTO 3x4 (SEPARADA)
-- ============================================
INSERT INTO categorias (id, nome, descricao, icone, cor, tipo, ativo, ordem)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Foto 3x4',
  'Tire sua foto 3x4 profissional',
  'camera',
  '#F59E0B',
  'faca_voce_mesmo',
  true,
  4
);

-- Foto 3x4
INSERT INTO servicos (categoria_id, nome, descricao_curta, descricao, icone, preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro, ativo, ordem)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Foto 3x4',
  'Tire selfie e receba 6 fotos 3x4',
  'Tire sua selfie pelo app. Editamos automaticamente com fundo branco e centralizamos. Receba 6 fotos em papel 10x15.',
  'camera',
  14.00,
  'Imediato',
  false,
  true,
  true,
  1
);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Banco de dados limpo e serviços REAIS populados com sucesso!';
  RAISE NOTICE 'Total de categorias: %', (SELECT COUNT(*) FROM categorias);
  RAISE NOTICE 'Total de serviços: %', (SELECT COUNT(*) FROM servicos);
  RAISE NOTICE '⚠️ IMPORTANTE: Todos os pedidos antigos foram deletados!';
END $$;
