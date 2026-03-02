-- ============================================
-- CRIAR PARCEIRO DE TESTE PARA DESENVOLVIMENTO
-- ============================================

-- Inserir parceiro de teste (Loja Copinet Própria)
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
  'Copinet Centro - Loja Própria',
  '12345678901',
  '(11)98765-4321',
  'centro@copinet.com.br',
  'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  '01310-100',
  'São Paulo',
  'SP',
  -23.561414,
  -46.655881,
  ST_SetSRID(ST_MakePoint(-46.655881, -23.561414), 4326)::geography,
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

-- Inserir mais um parceiro de teste (Parceiro comum)
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
  'Papelaria Silva',
  '98765432100',
  '(11)91234-5678',
  'silva@papelaria.com.br',
  'Rua Augusta, 500 - Consolação, São Paulo - SP',
  '01305-000',
  'São Paulo',
  'SP',
  -23.556858,
  -46.662742,
  ST_SetSRID(ST_MakePoint(-46.662742, -23.556858), 4326)::geography,
  true,
  '["pb", "colorida"]'::jsonb,
  'approved',
  true,
  false,
  95,
  2,
  10,
  '[]'::jsonb
);

-- Verificar parceiros criados
SELECT 
  id,
  nome_completo,
  is_loja_propria,
  is_online,
  ranking_score,
  tem_impressora,
  cidade
FROM parceiros
WHERE status = 'approved'
ORDER BY is_loja_propria DESC, ranking_score DESC;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Parceiros de teste criados com sucesso!';
  RAISE NOTICE 'Total de parceiros aprovados: %', (SELECT COUNT(*) FROM parceiros WHERE status = 'approved');
END $$;
