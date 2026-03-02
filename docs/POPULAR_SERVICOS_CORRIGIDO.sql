-- =====================================================
-- SCRIPT CORRIGIDO PARA POPULAR SERVIÇOS NO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Limpar serviços existentes (opcional - cuidado em produção!)
-- DELETE FROM servicos;

-- =====================================================
-- CATEGORIA: CERTIDÕES E DOCUMENTOS
-- =====================================================

-- Certidão de Antecedentes Criminais
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Certidão de Antecedentes Criminais',
  'Emissão de certidão de antecedentes criminais federal. Documento oficial para processos seletivos, viagens e outros fins.',
  50.00,
  40.00,
  '2-3 dias úteis',
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "placeholder": "000.000.000-00"},
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "placeholder": "DD/MM/AAAA"},
    {"nome": "nome_mae", "label": "Nome da Mãe", "tipo": "texto", "obrigatorio": true}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Certidões e Documentos';

-- Certidão de Nascimento
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Certidão de Nascimento (2ª via)',
  'Solicitação de segunda via da certidão de nascimento. Documento essencial para diversos procedimentos.',
  45.00,
  36.00,
  '3-5 dias úteis',
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "placeholder": "DD/MM/AAAA"},
    {"nome": "nome_mae", "label": "Nome da Mãe", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_pai", "label": "Nome do Pai", "tipo": "texto", "obrigatorio": false},
    {"nome": "cidade_nascimento", "label": "Cidade de Nascimento", "tipo": "texto", "obrigatorio": true},
    {"nome": "estado_nascimento", "label": "Estado", "tipo": "texto", "obrigatorio": true}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Certidões e Documentos';

-- Certidão de Casamento
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Certidão de Casamento (2ª via)',
  'Solicitação de segunda via da certidão de casamento.',
  45.00,
  36.00,
  '3-5 dias úteis',
  true,
  '[
    {"nome": "nome_completo_1", "label": "Nome Completo (Cônjuge 1)", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_completo_2", "label": "Nome Completo (Cônjuge 2)", "tipo": "texto", "obrigatorio": true},
    {"nome": "data_casamento", "label": "Data do Casamento", "tipo": "texto", "obrigatorio": true, "placeholder": "DD/MM/AAAA"},
    {"nome": "cidade_casamento", "label": "Cidade do Casamento", "tipo": "texto", "obrigatorio": true}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Certidões e Documentos';

-- =====================================================
-- CATEGORIA: IMPOSTO DE RENDA
-- =====================================================

-- Declaração IR Simples
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Declaração de IR - Simples',
  'Declaração completa de Imposto de Renda para pessoas físicas com rendimentos simples (até 2 fontes pagadoras).',
  150.00,
  120.00,
  '3-5 dias úteis',
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true},
    {"nome": "email", "label": "E-mail", "tipo": "email", "obrigatorio": true},
    {"nome": "tem_dependentes", "label": "Possui dependentes?", "tipo": "texto", "obrigatorio": true, "ajuda": "Sim ou Não"},
    {"nome": "observacoes", "label": "Informações Adicionais", "tipo": "textarea", "obrigatorio": false, "ajuda": "Informe outras fontes de renda, bens, etc."}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Imposto de Renda';

-- Declaração IR Completa
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Declaração de IR - Completa',
  'Declaração completa de Imposto de Renda para casos complexos (múltiplas fontes, investimentos, imóveis, etc.).',
  300.00,
  240.00,
  '5-7 dias úteis',
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true},
    {"nome": "email", "label": "E-mail", "tipo": "email", "obrigatorio": true},
    {"nome": "observacoes", "label": "Detalhes da Declaração", "tipo": "textarea", "obrigatorio": true, "ajuda": "Informe todas as fontes de renda, bens, investimentos, dependentes, etc."}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Imposto de Renda';

-- =====================================================
-- CATEGORIA: IMPRESSÃO
-- =====================================================

-- Impressão Simples P&B
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Impressão Preto e Branco',
  'Impressão de documentos em preto e branco. Preço por página.',
  0.50,
  0.40,
  'Imediato',
  true,
  '[
    {"nome": "quantidade_paginas", "label": "Quantidade de Páginas", "tipo": "texto", "obrigatorio": true, "placeholder": "Ex: 10"},
    {"nome": "tipo_papel", "label": "Tipo de Papel", "tipo": "texto", "obrigatorio": true, "ajuda": "Sulfite A4, Fotográfico, etc."},
    {"nome": "observacoes", "label": "Observações", "tipo": "textarea", "obrigatorio": false, "ajuda": "Frente e verso, encadernação, etc."}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Impressão';

-- Impressão Colorida
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Impressão Colorida',
  'Impressão de documentos coloridos. Preço por página.',
  2.00,
  1.60,
  'Imediato',
  true,
  '[
    {"nome": "quantidade_paginas", "label": "Quantidade de Páginas", "tipo": "texto", "obrigatorio": true, "placeholder": "Ex: 10"},
    {"nome": "tipo_papel", "label": "Tipo de Papel", "tipo": "texto", "obrigatorio": true, "ajuda": "Sulfite A4, Fotográfico, Couché, etc."},
    {"nome": "observacoes", "label": "Observações", "tipo": "textarea", "obrigatorio": false}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Impressão';

-- Foto 3x4 (SEM FORMULÁRIO - apenas upload de foto)
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Foto 3x4 Profissional',
  'Foto 3x4 com edição profissional. Cliente envia a foto e nós editamos conforme padrões oficiais.',
  15.00,
  12.00,
  '1-2 horas',
  false,
  '[]'::jsonb,
  true
FROM categorias WHERE nome = 'Impressão';

-- =====================================================
-- CATEGORIA: INSS E BENEFÍCIOS
-- =====================================================

-- Consulta INSS
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Consulta de Benefícios INSS',
  'Consulta completa de benefícios, extratos e situação no INSS.',
  40.00,
  32.00,
  '1-2 dias úteis',
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'INSS e Benefícios';

-- Agendamento INSS
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Agendamento no INSS',
  'Agendamento de perícia, atendimento ou outros serviços no INSS.',
  50.00,
  40.00,
  '1-2 dias úteis',
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true},
    {"nome": "tipo_agendamento", "label": "Tipo de Agendamento", "tipo": "texto", "obrigatorio": true, "ajuda": "Perícia, aposentadoria, pensão, etc."}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'INSS e Benefícios';

-- =====================================================
-- CATEGORIA: MEI E EMPRESAS
-- =====================================================

-- Abertura de MEI
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Abertura de MEI',
  'Abertura completa de MEI com orientação e suporte. Inclui registro no Portal do Empreendedor.',
  100.00,
  80.00,
  '2-3 dias úteis',
  true,
  '[
    {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true},
    {"nome": "email", "label": "E-mail", "tipo": "email", "obrigatorio": true},
    {"nome": "atividade", "label": "Atividade Principal", "tipo": "texto", "obrigatorio": true, "ajuda": "Ex: Cabeleireiro, Eletricista, etc."},
    {"nome": "endereco", "label": "Endereço Completo", "tipo": "textarea", "obrigatorio": true}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'MEI e Empresas';

-- Declaração Anual MEI
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Declaração Anual MEI (DASN-SIMEI)',
  'Declaração anual obrigatória para MEI. Evite multas e mantenha seu CNPJ regular.',
  80.00,
  64.00,
  '1-2 dias úteis',
  true,
  '[
    {"nome": "cnpj", "label": "CNPJ", "tipo": "texto", "obrigatorio": true},
    {"nome": "nome_empresarial", "label": "Nome Empresarial", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true},
    {"nome": "receita_bruta", "label": "Receita Bruta Anual", "tipo": "texto", "obrigatorio": true, "ajuda": "Valor total faturado no ano"}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'MEI e Empresas';

-- =====================================================
-- CATEGORIA: CURRÍCULOS E CARTAS
-- =====================================================

-- Currículo Profissional
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Currículo Profissional',
  'Criação de currículo profissional moderno e atrativo. Pode fazer você mesmo ou solicitar nossa criação.',
  50.00,
  40.00,
  '1-2 dias úteis',
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true},
    {"nome": "email", "label": "E-mail", "tipo": "email", "obrigatorio": true},
    {"nome": "objetivo", "label": "Objetivo Profissional", "tipo": "textarea", "obrigatorio": true},
    {"nome": "experiencias", "label": "Experiências Profissionais", "tipo": "textarea", "obrigatorio": true, "ajuda": "Liste suas experiências anteriores"},
    {"nome": "formacao", "label": "Formação Acadêmica", "tipo": "textarea", "obrigatorio": true}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Currículos e Cartas';

-- Carta de Apresentação
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, preco_desconto, tempo_estimado, requer_dados_cliente, campos_formulario, ativo)
SELECT 
  id,
  'Carta de Apresentação',
  'Carta de apresentação personalizada para processos seletivos.',
  30.00,
  24.00,
  '1 dia útil',
  true,
  '[
    {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
    {"nome": "vaga_pretendida", "label": "Vaga Pretendida", "tipo": "texto", "obrigatorio": true},
    {"nome": "empresa", "label": "Nome da Empresa", "tipo": "texto", "obrigatorio": true},
    {"nome": "informacoes", "label": "Suas Qualificações", "tipo": "textarea", "obrigatorio": true, "ajuda": "Conte sobre suas habilidades e experiências relevantes"}
  ]'::jsonb,
  true
FROM categorias WHERE nome = 'Currículos e Cartas';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar quantos serviços foram inseridos
SELECT 
  c.nome as categoria,
  COUNT(s.id) as total_servicos
FROM categorias c
LEFT JOIN servicos s ON s.categoria_id = c.id
GROUP BY c.id, c.nome
ORDER BY c.nome;
