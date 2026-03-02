-- ============================================
-- CRIAR PARCEIROS DE TESTE - CUBATÃO, SP
-- VERSÃO CORRIGIDA - SEM ERROS DE TIPO
-- ============================================

-- Limpar parceiros de teste anteriores
DELETE FROM parceiros WHERE cpf IN ('11122233344', '55566677788', '99988877766');

-- Parceiro 1: Copinet Cubatão Centro (Loja Própria)
INSERT INTO parceiros (
  nome_completo,
  cpf,
  telefone,
  email,
  cidade,
  estado,
  cep,
  endereco_completo,
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
  'Copinet Cubatão Centro',
  '11122233344',
  '(13)99876-5432',
  'cubatao@copinet.com.br',
  'Cubatão',
  'SP',
  '11510-000',
  'Av. 9 de Abril, 1500 - Centro, Cubatão - SP',
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
)
ON CONFLICT (cpf) DO UPDATE SET
  is_online = true,
  status = 'approved',
  latitude = -23.8950,
  longitude = -46.4250,
  localizacao = ST_SetSRID(ST_MakePoint(-46.4250, -23.8950), 4326)::geography;

-- Parceiro 2: Papelaria Vila Nova
INSERT INTO parceiros (
  nome_completo,
  cpf,
  telefone,
  email,
  cidade,
  estado,
  cep,
  endereco_completo,
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
  'Cubatão',
  'SP',
  '11533-000',
  'Rua Armando Sales de Oliveira, 300 - Vila Nova, Cubatão - SP',
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
)
ON CONFLICT (cpf) DO UPDATE SET
  is_online = true,
  status = 'approved',
  latitude = -23.8800,
  longitude = -46.4150,
  localizacao = ST_SetSRID(ST_MakePoint(-46.4150, -23.8800), 4326)::geography;

-- Parceiro 3: Gráfica Rápida Cubatão
INSERT INTO parceiros (
  nome_completo,
  cpf,
  telefone,
  email,
  cidade,
  estado,
  cep,
  endereco_completo,
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
  'Cubatão',
  'SP',
  '11530-000',
  'Av. Martins Fontes, 800 - Jardim Casqueiro, Cubatão - SP',
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
)
ON CONFLICT (cpf) DO UPDATE SET
  is_online = true,
  status = 'approved',
  latitude = -23.9050,
  longitude = -46.4100,
  localizacao = ST_SetSRID(ST_MakePoint(-46.4100, -23.9050), 4326)::geography;

-- Verificar parceiros criados
SELECT 
  id,
  nome_completo,
  cidade,
  is_loja_propria,
  is_online,
  ranking_score,
  tem_impressora,
  status,
  ST_AsText(localizacao) as localizacao_texto,
  ST_Y(localizacao::geometry) as latitude,
  ST_X(localizacao::geometry) as longitude
FROM parceiros
WHERE cpf IN ('11122233344', '55566677788', '99988877766')
ORDER BY is_loja_propria DESC, ranking_score DESC;

-- Testar busca de parceiros próximos
-- IMPORTANTE: Se der erro de tipo, a função precisa ser recriada
DO $$
BEGIN
  -- Testar se a função existe e funciona
  PERFORM * FROM buscar_parceiros_proximos(
    -23.8950,  -- Latitude Cubatão Centro
    -46.4250,  -- Longitude Cubatão Centro
    10,        -- Raio 10km
    NULL,      -- servico_id
    true       -- precisa_impressora
  );
  
  RAISE NOTICE 'Função buscar_parceiros_proximos funcionando!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO na função: %. Recriando função...', SQLERRM;
    
    -- Recriar função com tipos corretos
    DROP FUNCTION IF EXISTS buscar_parceiros_proximos(numeric, numeric, integer, uuid, boolean);
    
    CREATE OR REPLACE FUNCTION buscar_parceiros_proximos(
      lat numeric,
      lng numeric,
      raio_km integer DEFAULT 10,
      servico_id uuid DEFAULT NULL,
      precisa_impressora boolean DEFAULT false
    )
    RETURNS TABLE (
      id uuid,
      nome_completo text,
      endereco_completo text,
      distancia double precision,
      ranking_score integer,
      fila_atual integer,
      tempo_estimado_fila integer,
      latitude numeric,
      longitude numeric,
      is_loja_propria boolean
    )
    LANGUAGE plpgsql
    AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        p.id,
        p.nome_completo::text,
        p.endereco_completo::text,
        ST_Distance(
          p.localizacao,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) as distancia,
        p.ranking_score,
        p.fila_atual,
        p.tempo_estimado_fila,
        p.latitude,
        p.longitude,
        p.is_loja_propria
      FROM parceiros p
      WHERE 
        p.status = 'approved'
        AND p.is_online = true
        AND p.localizacao IS NOT NULL
        AND ST_DWithin(
          p.localizacao,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          raio_km * 1000
        )
        AND (precisa_impressora = false OR p.tem_impressora = true)
        AND (servico_id IS NULL OR p.servicos_oferecidos @> to_jsonb(servico_id::text))
      ORDER BY 
        p.is_loja_propria DESC,
        p.ranking_score DESC,
        distancia ASC
      LIMIT 20;
    END;
    $func$;
    
    RAISE NOTICE 'Função recriada com sucesso!';
END;
$$;

-- Testar novamente após correção
SELECT 
  nome_completo,
  endereco_completo,
  ROUND(distancia::numeric / 1000, 2) as distancia_km,
  ranking_score,
  is_loja_propria,
  fila_atual,
  tempo_estimado_fila
FROM buscar_parceiros_proximos(
  -23.8950,  -- Latitude Cubatão Centro
  -46.4250,  -- Longitude Cubatão Centro
  10,        -- Raio 10km
  NULL,      -- servico_id
  true       -- precisa_impressora
)
ORDER BY is_loja_propria DESC, ranking_score DESC;
