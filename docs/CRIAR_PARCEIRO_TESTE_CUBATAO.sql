-- ============================================
-- CRIAR PARCEIROS DE TESTE - CUBATÃO, SP
-- ============================================

-- Primeiro, vamos verificar quais colunas existem na tabela parceiros
-- e adicionar as que estão faltando

DO $$ 
BEGIN
    -- Adicionar endereco_completo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='endereco_completo') THEN
        ALTER TABLE parceiros ADD COLUMN endereco_completo TEXT;
    END IF;

    -- Adicionar cep se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='cep') THEN
        ALTER TABLE parceiros ADD COLUMN cep TEXT;
    END IF;

    -- Adicionar cidade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='cidade') THEN
        ALTER TABLE parceiros ADD COLUMN cidade TEXT;
    END IF;

    -- Adicionar estado se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='estado') THEN
        ALTER TABLE parceiros ADD COLUMN estado TEXT;
    END IF;
END $$;

-- Agora inserir parceiros de teste em Cubatão, SP

-- Parceiro 1: Copinet Cubatão - Loja Própria (Centro)
INSERT INTO parceiros (
  nome_completo,
  cpf,
  telefone,
  email,
  endereco_completo,
  cep,
  cidade,
  estado,
  latitude,
  longitude,
  localizacao,
  tem_impressora,
  tipos_impressora,
  status,
  is_online,
  is_loja_propria,
  ranking_score,
  fila_atual,
  tempo_estimado_fila,
  servicos_oferecidos
) VALUES (
  'Copinet Cubatão Centro - Loja Própria',
  '11122233344',
  '(13)99876-5432',
  'cubatao@copinet.com.br',
  'Av. 9 de Abril, 1500 - Centro, Cubatão - SP',
  '11510-000',
  'Cubatão',
  'SP',
  -23.8950,
  -46.4250,
  ST_SetSRID(ST_MakePoint(-46.4250, -23.8950), 4326)::geography,
  true,
  '["pb", "colorida", "fotografica"]'::jsonb,
  'approved',
  true,
  true,
  100,
  0,
  0,
  '[]'::jsonb
);

-- Parceiro 2: Papelaria Vila Nova (Bairro Vila Nova)
INSERT INTO parceiros (
  nome_completo,
  cpf,
  telefone,
  email,
  endereco_completo,
  cep,
  cidade,
  estado,
  latitude,
  longitude,
  localizacao,
  tem_impressora,
  tipos_impressora,
  status,
  is_online,
  is_loja_propria,
  ranking_score,
  fila_atual,
  tempo_estimado_fila,
  servicos_oferecidos
) VALUES (
  'Papelaria Vila Nova',
  '55566677788',
  '(13)98765-4321',
  'vilanova@papelaria.com.br',
  'Rua Armando Sales de Oliveira, 300 - Vila Nova, Cubatão - SP',
  '11533-000',
  'Cubatão',
  'SP',
  -23.8800,
  -46.4150,
  ST_SetSRID(ST_MakePoint(-46.4150, -23.8800), 4326)::geography,
  true,
  '["pb", "colorida"]'::jsonb,
  'approved',
  true,
  false,
  95,
  1,
  5,
  '[]'::jsonb
);

-- Parceiro 3: Gráfica Rápida Cubatão (Jardim Casqueiro)
INSERT INTO parceiros (
  nome_completo,
  cpf,
  telefone,
  email,
  endereco_completo,
  cep,
  cidade,
  estado,
  latitude,
  longitude,
  localizacao,
  tem_impressora,
  tipos_impressora,
  status,
  is_online,
  is_loja_propria,
  ranking_score,
  fila_atual,
  tempo_estimado_fila,
  servicos_oferecidos
) VALUES (
  'Gráfica Rápida Cubatão',
  '99988877766',
  '(13)97654-3210',
  'grafica@rapidacubatao.com.br',
  'Av. Martins Fontes, 800 - Jardim Casqueiro, Cubatão - SP',
  '11530-000',
  'Cubatão',
  'SP',
  -23.9050,
  -46.4100,
  ST_SetSRID(ST_MakePoint(-46.4100, -23.9050), 4326)::geography,
  true,
  '["pb", "colorida", "fotografica"]'::jsonb,
  'approved',
  true,
  false,
  90,
  3,
  15,
  '[]'::jsonb
);

-- Verificar parceiros criados
SELECT 
  id,
  nome_completo,
  cidade,
  is_loja_propria,
  is_online,
  ranking_score,
  tem_impressora,
  fila_atual
FROM parceiros
WHERE status = 'approved' AND cidade = 'Cubatão'
ORDER BY is_loja_propria DESC, ranking_score DESC;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Parceiros de teste criados em Cubatão, SP!';
  RAISE NOTICE 'Total de parceiros em Cubatão: %', (SELECT COUNT(*) FROM parceiros WHERE cidade = 'Cubatão' AND status = 'approved');
  RAISE NOTICE '';
  RAISE NOTICE '📍 Localizações:';
  RAISE NOTICE '1. Copinet Cubatão Centro (Loja Própria) - Av. 9 de Abril, 1500';
  RAISE NOTICE '2. Papelaria Vila Nova - Rua Armando Sales de Oliveira, 300';
  RAISE NOTICE '3. Gráfica Rápida - Av. Martins Fontes, 800';
END $$;
