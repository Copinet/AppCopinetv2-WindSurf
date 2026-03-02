-- ============================================
-- CRIAR PARCEIROS DE TESTE - CUBATÃO, SP
-- VERSÃO SIMPLIFICADA E GARANTIDA
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
);

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
);

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
  status,
  ST_AsText(localizacao) as localizacao_texto
FROM parceiros
WHERE cpf IN ('11122233344', '55566677788', '99988877766')
ORDER BY is_loja_propria DESC, ranking_score DESC;

-- Testar função de busca
SELECT * FROM buscar_parceiros_proximos(
  -23.8950,  -- Latitude Cubatão Centro
  -46.4250,  -- Longitude Cubatão Centro
  10         -- Raio 10km
);
