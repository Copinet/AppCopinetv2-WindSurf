-- ============================================
-- SCRIPT DE POPULAÇÃO DE SERVIÇOS - VERSÃO CORRIGIDA V2
-- Data: 26/02/2026
-- Baseado em: SERVICOS_PRECOS_REFERENCIA.md
-- ============================================

-- LIMPAR SERVIÇOS EXISTENTES (CUIDADO EM PRODUÇÃO!)
-- DELETE FROM servicos WHERE categoria_id IN (SELECT id FROM categorias);

-- ============================================
-- CERTIDÕES E DOCUMENTOS
-- ============================================

-- Categoria: Certidões e Documentos
DO $$
DECLARE
  cat_certidoes_id UUID;
BEGIN
  -- Buscar ou criar categoria
  SELECT id INTO cat_certidoes_id FROM categorias WHERE nome = 'Certidões e Documentos' LIMIT 1;
  
  IF cat_certidoes_id IS NULL THEN
    INSERT INTO categorias (nome, descricao, icone, cor, tipo, ativo, ordem)
    VALUES ('Certidões e Documentos', 'Emissão de certidões e documentos oficiais', 'document-text', '#3B82F6', 'fazemos_pra_voce', true, 1)
    RETURNING id INTO cat_certidoes_id;
  END IF;

  -- Antecedentes Criminais Federal
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, preco_desconto, percentual_desconto,
    tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_certidoes_id,
    'Antecedentes Criminais Federal',
    'Certidão de antecedentes criminais da Polícia Federal',
    'Emissão de certidão de antecedentes criminais junto à Polícia Federal. Documento necessário para concursos, viagens internacionais e processos jurídicos.',
    'shield-checkmark',
    5.00, 4.00, NULL,
    'Até 20 minutos',
    true, true,
    '[
      {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true, "placeholder": "Digite seu nome completo"},
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "placeholder": "000.000.000-00", "validacao": "cpf"},
      {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "placeholder": "DD/MM/AAAA", "validacao": "data"}
    ]'::jsonb,
    true, 1
  ) ON CONFLICT DO NOTHING;

  -- Antecedentes Criminais Estadual (SP)
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, preco_desconto, percentual_desconto,
    tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_certidoes_id,
    'Antecedentes Criminais Estadual (SP)',
    'Certidão de antecedentes criminais do Estado de São Paulo',
    'Emissão de certidão de antecedentes criminais junto à Secretaria de Segurança Pública do Estado de São Paulo.',
    'shield-checkmark',
    5.00, 4.00, NULL,
    'Até 20 minutos',
    true, true,
    '[
      {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "rg", "label": "RG", "tipo": "texto", "obrigatorio": true},
      {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data"}
    ]'::jsonb,
    true, 2
  ) ON CONFLICT DO NOTHING;

  -- Certidão de Quitação Eleitoral
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_certidoes_id,
    'Certidão de Quitação Eleitoral',
    'Certidão que comprova regularidade eleitoral',
    'Documento emitido pelo TSE que comprova estar em dia com as obrigações eleitorais.',
    'checkbox',
    5.00, 'Até 20 minutos', true, true,
    '[
      {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data"}
    ]'::jsonb,
    true, 3
  ) ON CONFLICT DO NOTHING;

  -- Situação Cadastral CPF
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_certidoes_id,
    'Situação Cadastral CPF',
    'Consulta de situação do CPF na Receita Federal',
    'Comprovante de situação cadastral do CPF emitido pela Receita Federal.',
    'card',
    5.00, 'Até 20 minutos', true, true,
    '[
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data"}
    ]'::jsonb,
    true, 4
  ) ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- MEI E EMPRESAS
-- ============================================

DO $$
DECLARE
  cat_mei_id UUID;
BEGIN
  SELECT id INTO cat_mei_id FROM categorias WHERE nome = 'MEI e Empresas' LIMIT 1;
  
  IF cat_mei_id IS NULL THEN
    INSERT INTO categorias (nome, descricao, icone, cor, tipo, ativo, ordem)
    VALUES ('MEI e Empresas', 'Serviços para MEI e empresas', 'briefcase', '#8B5CF6', 'fazemos_pra_voce', true, 2)
    RETURNING id INTO cat_mei_id;
  END IF;

  -- Abertura de MEI
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_mei_id,
    'Abertura de MEI',
    'Abertura de MEI completa e rápida',
    'Realizamos todo o processo de abertura do seu MEI. Necessário senha Gov.br com verificação em 2 etapas desativada.',
    'business',
    80.00, 'Até 2 horas', true, true,
    '[
      {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data"},
      {"nome": "telefone", "label": "Telefone", "tipo": "telefone", "obrigatorio": true, "validacao": "telefone", "placeholder": "(00)00000-0000"},
      {"nome": "endereco_residencial", "label": "Endereço Residencial Completo", "tipo": "textarea", "obrigatorio": true},
      {"nome": "mesmo_endereco", "label": "Endereço comercial é o mesmo que residencial", "tipo": "checkbox", "obrigatorio": false},
      {"nome": "endereco_comercial", "label": "Endereço Comercial Completo", "tipo": "textarea", "obrigatorio": false, "condicional": "mesmo_endereco=false"},
      {"nome": "senha_govbr", "label": "Senha Gov.br", "tipo": "senha", "obrigatorio": true, "ajuda": "Verificação em 2 etapas deve estar DESATIVADA"}
    ]'::jsonb,
    true, 1
  ) ON CONFLICT DO NOTHING;

  -- Emitir DAS Mensal
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_mei_id,
    'Emitir DAS Mensal',
    'Emissão do boleto DAS do MEI',
    'Emitimos o boleto DAS mensal do seu MEI para pagamento.',
    'document',
    3.00, 'Até 20 minutos', true, true,
    '[
      {"nome": "cnpj", "label": "CNPJ do MEI", "tipo": "texto", "obrigatorio": true, "validacao": "cnpj"}
    ]'::jsonb,
    true, 2
  ) ON CONFLICT DO NOTHING;

  -- Declaração Anual DASN-SIMEI
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_mei_id,
    'Declaração Anual DASN-SIMEI',
    'Declaração anual do MEI',
    'Realizamos a declaração anual do MEI (DASN-SIMEI). Serviço exclusivo para lojas Copinet.',
    'document-text',
    55.00, 'Até 2 horas', true, true,
    '[
      {"nome": "cnpj", "label": "CNPJ do MEI", "tipo": "texto", "obrigatorio": true, "validacao": "cnpj"},
      {"nome": "ano", "label": "Ano da Declaração", "tipo": "texto", "obrigatorio": true},
      {"nome": "atividade", "label": "Atividade Principal", "tipo": "select", "obrigatorio": true, "opcoes": ["Comércio", "Serviço", "Transporte de Cargas"]},
      {"nome": "valor_declarar", "label": "Valor a Declarar (R$)", "tipo": "texto", "obrigatorio": true}
    ]'::jsonb,
    true, 3
  ) ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- IMPOSTO DE RENDA
-- ============================================

DO $$
DECLARE
  cat_ir_id UUID;
BEGIN
  SELECT id INTO cat_ir_id FROM categorias WHERE nome = 'Imposto de Renda' LIMIT 1;
  
  IF cat_ir_id IS NULL THEN
    INSERT INTO categorias (nome, descricao, icone, cor, tipo, ativo, ordem)
    VALUES ('Imposto de Renda', 'Declaração de Imposto de Renda', 'calculator', '#EF4444', 'fazemos_pra_voce', true, 3)
    RETURNING id INTO cat_ir_id;
  END IF;

  -- Declaração de Imposto de Renda (ÚNICO)
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_ir_id,
    'Declaração de Imposto de Renda',
    'Declaração completa para CLT, Aposentado e Pensionista',
    'Fazemos sua declaração de Imposto de Renda. Atendemos CLT, Aposentados e Pensionistas. NÃO fazemos para: Ações, Criptomoedas, FIIs, BDRs, ETFs e investimentos de renda variável. Prazo de entrega: 3 dias.',
    'calculator',
    65.00, '3 dias', true, true,
    '[
      {"nome": "opcao_senha", "label": "Como deseja enviar os dados?", "tipo": "radio", "obrigatorio": true, "opcoes": ["Com Senha Gov.br", "Sem Senha (Upload de Documentos)"]},
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "nome_completo", "label": "Nome Completo", "tipo": "texto", "obrigatorio": true},
      {"nome": "data_nascimento", "label": "Data de Nascimento", "tipo": "texto", "obrigatorio": true, "validacao": "data"},
      {"nome": "endereco_completo", "label": "Endereço Completo", "tipo": "textarea", "obrigatorio": true},
      {"nome": "tipo_chave_pix", "label": "Tipo de Chave PIX", "tipo": "select", "obrigatorio": true, "opcoes": ["CPF", "Dados Bancários"]},
      {"nome": "chave_pix", "label": "Chave PIX (se CPF)", "tipo": "texto", "obrigatorio": false, "condicional": "tipo_chave_pix=CPF"},
      {"nome": "banco", "label": "Nome do Banco", "tipo": "texto", "obrigatorio": false, "condicional": "tipo_chave_pix=Dados Bancários"},
      {"nome": "agencia", "label": "Agência", "tipo": "texto", "obrigatorio": false, "condicional": "tipo_chave_pix=Dados Bancários"},
      {"nome": "conta", "label": "Conta", "tipo": "texto", "obrigatorio": false, "condicional": "tipo_chave_pix=Dados Bancários"},
      {"nome": "senha_govbr", "label": "Senha Gov.br", "tipo": "senha", "obrigatorio": false, "condicional": "opcao_senha=Com Senha Gov.br", "ajuda": "Verificação em 2 etapas DESATIVADA"},
      {"nome": "tem_dependentes", "label": "Possui dependentes?", "tipo": "radio", "obrigatorio": true, "opcoes": ["Sim", "Não"]},
      {"nome": "informacoes_complementares", "label": "Informações Complementares", "tipo": "textarea", "obrigatorio": false}
    ]'::jsonb,
    true, 1
  ) ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- INSS E BENEFÍCIOS
-- ============================================

DO $$
DECLARE
  cat_inss_id UUID;
BEGIN
  SELECT id INTO cat_inss_id FROM categorias WHERE nome = 'INSS e Benefícios' LIMIT 1;
  
  IF cat_inss_id IS NULL THEN
    INSERT INTO categorias (nome, descricao, icone, cor, tipo, ativo, ordem)
    VALUES ('INSS e Benefícios', 'Serviços relacionados ao INSS', 'medical', '#10B981', 'fazemos_pra_voce', true, 4)
    RETURNING id INTO cat_inss_id;
  END IF;

  -- Extrato de Pagamento de Benefício
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, icone, preco_base,
    tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_inss_id,
    'Extrato de Pagamento de Benefício',
    'Extrato detalhado de pagamentos do INSS',
    'receipt',
    5.00, 'Até 20 minutos', true, true,
    '[
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "senha_govbr", "label": "Senha Gov.br", "tipo": "senha", "obrigatorio": true, "ajuda": "Verificação em 2 etapas DESATIVADA"}
    ]'::jsonb,
    true, 1
  ) ON CONFLICT DO NOTHING;

  -- Simular Aposentadoria
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, icone, preco_base,
    tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_inss_id,
    'Simular Aposentadoria',
    'Simulação de aposentadoria pelo INSS',
    'calculator',
    20.00, 'Até 1 hora', true, true,
    '[
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "senha_govbr", "label": "Senha Gov.br", "tipo": "senha", "obrigatorio": true}
    ]'::jsonb,
    true, 2
  ) ON CONFLICT DO NOTHING;

  -- Requerer Aposentadoria
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, icone, preco_base,
    tempo_estimado, requer_dados_cliente, requer_parceiro,
    campos_formulario, ativo, ordem
  ) VALUES (
    cat_inss_id,
    'Requerer Aposentadoria',
    'Solicitação de aposentadoria pelo INSS',
    'ribbon',
    35.00, 'Até 2 horas', true, true,
    '[
      {"nome": "cpf", "label": "CPF", "tipo": "texto", "obrigatorio": true, "validacao": "cpf"},
      {"nome": "senha_govbr", "label": "Senha Gov.br", "tipo": "senha", "obrigatorio": true},
      {"nome": "tipo_aposentadoria", "label": "Tipo de Aposentadoria", "tipo": "select", "obrigatorio": true, "opcoes": ["Por Idade", "Por Tempo de Contribuição", "Por Invalidez"]}
    ]'::jsonb,
    true, 3
  ) ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- IMPRESSÃO (Criar categoria se não existir)
-- ============================================

DO $$
DECLARE
  cat_impressao_id UUID;
BEGIN
  SELECT id INTO cat_impressao_id FROM categorias WHERE nome = 'Impressão' LIMIT 1;
  
  IF cat_impressao_id IS NULL THEN
    INSERT INTO categorias (nome, descricao, icone, cor, tipo, ativo, ordem)
    VALUES ('Impressão', 'Impressão de documentos, fotos e foto 3x4', 'print', '#10B981', 'faca_voce_mesmo', true, 5)
    RETURNING id INTO cat_impressao_id;
  END IF;

  -- Foto 3x4
  INSERT INTO servicos (
    categoria_id, nome, descricao_curta, descricao, icone,
    preco_base, tempo_estimado, requer_dados_cliente, requer_parceiro,
    ativo, ordem
  ) VALUES (
    cat_impressao_id,
    'Foto 3x4',
    'Tire sua foto 3x4 profissional pelo app',
    'Tire selfie, editamos automaticamente com fundo branco e centralizamos. Receba 6 fotos em papel 10x15.',
    'camera',
    5.00, 'Imediato', false, false,
    true, 1
  ) ON CONFLICT DO NOTHING;

END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Serviços populados com sucesso!';
  RAISE NOTICE 'Total de categorias: %', (SELECT COUNT(*) FROM categorias WHERE ativo = true);
  RAISE NOTICE 'Total de serviços: %', (SELECT COUNT(*) FROM servicos WHERE ativo = true);
END $$;
