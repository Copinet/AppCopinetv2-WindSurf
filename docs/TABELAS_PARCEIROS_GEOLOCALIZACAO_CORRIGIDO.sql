-- ============================================
-- TABELAS PARA SISTEMA DE PARCEIROS E GEOLOCALIZAÇÃO
-- FASE 3 - COPINET - VERSÃO CORRIGIDA
-- Data: 28/02/2026
-- ============================================

-- ============================================
-- EXTENSÃO POSTGIS (para geolocalização)
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- ATUALIZAR TABELA PARCEIROS EXISTENTE
-- ============================================

-- Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
    -- Adicionar is_online se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='is_online') THEN
        ALTER TABLE parceiros ADD COLUMN is_online BOOLEAN DEFAULT false;
    END IF;

    -- Adicionar is_loja_propria se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='is_loja_propria') THEN
        ALTER TABLE parceiros ADD COLUMN is_loja_propria BOOLEAN DEFAULT false;
    END IF;

    -- Adicionar latitude se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='latitude') THEN
        ALTER TABLE parceiros ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    -- Adicionar longitude se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='longitude') THEN
        ALTER TABLE parceiros ADD COLUMN longitude DECIMAL(11, 8);
    END IF;

    -- Adicionar localizacao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='localizacao') THEN
        ALTER TABLE parceiros ADD COLUMN localizacao GEOGRAPHY(POINT, 4326);
    END IF;

    -- Adicionar tem_impressora se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='tem_impressora') THEN
        ALTER TABLE parceiros ADD COLUMN tem_impressora BOOLEAN DEFAULT false;
    END IF;

    -- Adicionar tipos_impressora se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='tipos_impressora') THEN
        ALTER TABLE parceiros ADD COLUMN tipos_impressora JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Adicionar ranking_score se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='ranking_score') THEN
        ALTER TABLE parceiros ADD COLUMN ranking_score INTEGER DEFAULT 100;
    END IF;

    -- Adicionar total_pedidos se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='total_pedidos') THEN
        ALTER TABLE parceiros ADD COLUMN total_pedidos INTEGER DEFAULT 0;
    END IF;

    -- Adicionar total_aceitos se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='total_aceitos') THEN
        ALTER TABLE parceiros ADD COLUMN total_aceitos INTEGER DEFAULT 0;
    END IF;

    -- Adicionar total_recusados se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='total_recusados') THEN
        ALTER TABLE parceiros ADD COLUMN total_recusados INTEGER DEFAULT 0;
    END IF;

    -- Adicionar total_concluidos se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='total_concluidos') THEN
        ALTER TABLE parceiros ADD COLUMN total_concluidos INTEGER DEFAULT 0;
    END IF;

    -- Adicionar tempo_medio_resposta se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='tempo_medio_resposta') THEN
        ALTER TABLE parceiros ADD COLUMN tempo_medio_resposta INTEGER;
    END IF;

    -- Adicionar fila_atual se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='fila_atual') THEN
        ALTER TABLE parceiros ADD COLUMN fila_atual INTEGER DEFAULT 0;
    END IF;

    -- Adicionar tempo_estimado_fila se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='tempo_estimado_fila') THEN
        ALTER TABLE parceiros ADD COLUMN tempo_estimado_fila INTEGER DEFAULT 0;
    END IF;

    -- Adicionar horario_funcionamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='horario_funcionamento') THEN
        ALTER TABLE parceiros ADD COLUMN horario_funcionamento JSONB DEFAULT '{
          "segunda": {"abre": "08:00", "fecha": "18:00", "ativo": true},
          "terca": {"abre": "08:00", "fecha": "18:00", "ativo": true},
          "quarta": {"abre": "08:00", "fecha": "18:00", "ativo": true},
          "quinta": {"abre": "08:00", "fecha": "18:00", "ativo": true},
          "sexta": {"abre": "08:00", "fecha": "18:00", "ativo": true},
          "sabado": {"abre": "08:00", "fecha": "12:00", "ativo": false},
          "domingo": {"abre": "00:00", "fecha": "00:00", "ativo": false}
        }'::jsonb;
    END IF;

    -- Adicionar last_online_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='last_online_at') THEN
        ALTER TABLE parceiros ADD COLUMN last_online_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Adicionar servicos_oferecidos se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='parceiros' AND column_name='servicos_oferecidos') THEN
        ALTER TABLE parceiros ADD COLUMN servicos_oferecidos JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_parceiros_is_online ON parceiros(is_online);
CREATE INDEX IF NOT EXISTS idx_parceiros_localizacao ON parceiros USING GIST(localizacao);
CREATE INDEX IF NOT EXISTS idx_parceiros_ranking ON parceiros(ranking_score DESC);

-- ============================================
-- TABELA: pedidos_impressao
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos_impressao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  parceiro_id UUID REFERENCES parceiros(id),
  
  -- Detalhes da Impressão
  arquivos JSONB NOT NULL,
  total_paginas INTEGER NOT NULL,
  preco_impressao DECIMAL(10, 2) NOT NULL,
  mensagem_cliente TEXT,
  
  -- Status
  status TEXT DEFAULT 'aguardando_parceiro' CHECK (status IN (
    'aguardando_parceiro',
    'aceito',
    'recusado',
    'timeout',
    'imprimindo',
    'pronto',
    'retirado',
    'cancelado'
  )),
  
  -- Controle de Tempo
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respondido_em TIMESTAMP WITH TIME ZONE,
  pronto_em TIMESTAMP WITH TIME ZONE,
  retirado_em TIMESTAMP WITH TIME ZONE,
  tempo_resposta INTEGER,
  
  -- QR Code
  qr_code_data TEXT,
  qr_code_gerado_em TIMESTAMP WITH TIME ZONE,
  
  -- Histórico de Tentativas
  tentativas JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_impressao_pedido ON pedidos_impressao(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_impressao_parceiro ON pedidos_impressao(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_impressao_status ON pedidos_impressao(status);

-- ============================================
-- TABELA: ranking_historico
-- ============================================
CREATE TABLE IF NOT EXISTS ranking_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parceiro_id UUID REFERENCES parceiros(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id),
  
  -- Ação
  acao TEXT NOT NULL CHECK (acao IN ('aceite', 'recusa', 'timeout', 'conclusao', 'avaliacao')),
  pontos_alterados INTEGER NOT NULL,
  ranking_anterior INTEGER NOT NULL,
  ranking_novo INTEGER NOT NULL,
  
  -- Detalhes
  motivo TEXT,
  tempo_resposta INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ranking_historico_parceiro ON ranking_historico(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_ranking_historico_created ON ranking_historico(created_at DESC);

-- ============================================
-- TABELA: disponibilidade_parceiros
-- ============================================
CREATE TABLE IF NOT EXISTS disponibilidade_parceiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parceiro_id UUID REFERENCES parceiros(id) ON DELETE CASCADE,
  
  -- Status
  is_disponivel BOOLEAN DEFAULT true,
  motivo_indisponibilidade TEXT,
  
  -- Período
  inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fim TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_disponibilidade_parceiro ON disponibilidade_parceiros(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidade_periodo ON disponibilidade_parceiros(inicio, fim);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para buscar parceiros próximos
CREATE OR REPLACE FUNCTION buscar_parceiros_proximos(
  lat DECIMAL,
  lng DECIMAL,
  raio_km INTEGER DEFAULT 10,
  servico_id UUID DEFAULT NULL,
  precisa_impressora BOOLEAN DEFAULT false
)
RETURNS TABLE (
  parceiro_id UUID,
  nome TEXT,
  endereco_completo TEXT,
  distancia_metros DECIMAL,
  ranking_score INTEGER,
  fila_atual INTEGER,
  tempo_estimado_fila INTEGER,
  latitude DECIMAL,
  longitude DECIMAL,
  is_loja_propria BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    p.endereco_completo,
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
$$ LANGUAGE plpgsql;

-- Função para atualizar ranking
CREATE OR REPLACE FUNCTION atualizar_ranking_parceiro(
  p_parceiro_id UUID,
  p_acao TEXT,
  p_pedido_id UUID DEFAULT NULL,
  p_tempo_resposta INTEGER DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_ranking_atual INTEGER;
  v_pontos_alteracao INTEGER := 0;
  v_ranking_novo INTEGER;
BEGIN
  -- Buscar ranking atual
  SELECT ranking_score INTO v_ranking_atual
  FROM parceiros
  WHERE id = p_parceiro_id;
  
  -- Calcular alteração de pontos
  CASE p_acao
    WHEN 'aceite' THEN
      v_pontos_alteracao := 2;
      IF p_tempo_resposta IS NOT NULL AND p_tempo_resposta < 60 THEN
        v_pontos_alteracao := v_pontos_alteracao + 1;
      END IF;
    WHEN 'recusa' THEN
      v_pontos_alteracao := -5;
    WHEN 'timeout' THEN
      v_pontos_alteracao := -10;
    WHEN 'conclusao' THEN
      v_pontos_alteracao := 5;
    WHEN 'avaliacao' THEN
      v_pontos_alteracao := 3;
  END CASE;
  
  -- Calcular novo ranking (mínimo 0, máximo 100)
  v_ranking_novo := GREATEST(0, LEAST(100, v_ranking_atual + v_pontos_alteracao));
  
  -- Atualizar parceiro
  UPDATE parceiros
  SET 
    ranking_score = v_ranking_novo,
    total_aceitos = CASE WHEN p_acao = 'aceite' THEN total_aceitos + 1 ELSE total_aceitos END,
    total_recusados = CASE WHEN p_acao = 'recusa' THEN total_recusados + 1 ELSE total_recusados END,
    total_concluidos = CASE WHEN p_acao = 'conclusao' THEN total_concluidos + 1 ELSE total_concluidos END,
    updated_at = NOW()
  WHERE id = p_parceiro_id;
  
  -- Registrar no histórico
  INSERT INTO ranking_historico (
    parceiro_id,
    pedido_id,
    acao,
    pontos_alterados,
    ranking_anterior,
    ranking_novo,
    tempo_resposta
  ) VALUES (
    p_parceiro_id,
    p_pedido_id,
    p_acao,
    v_pontos_alteracao,
    v_ranking_atual,
    v_ranking_novo,
    p_tempo_resposta
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_parceiros_updated_at ON parceiros;
CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON parceiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_impressao_updated_at ON pedidos_impressao;
CREATE TRIGGER update_pedidos_impressao_updated_at
  BEFORE UPDATE ON pedidos_impressao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_impressao ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidade_parceiros ENABLE ROW LEVEL SECURITY;

-- Políticas para parceiros
DROP POLICY IF EXISTS "Parceiros podem ver seus próprios dados" ON parceiros;
CREATE POLICY "Parceiros podem ver seus próprios dados"
  ON parceiros FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Parceiros podem atualizar seus próprios dados" ON parceiros;
CREATE POLICY "Parceiros podem atualizar seus próprios dados"
  ON parceiros FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clientes podem ver parceiros aprovados" ON parceiros;
CREATE POLICY "Clientes podem ver parceiros aprovados"
  ON parceiros FOR SELECT
  USING (status = 'approved');

-- Políticas para pedidos_impressao
DROP POLICY IF EXISTS "Clientes veem seus pedidos de impressão" ON pedidos_impressao;
CREATE POLICY "Clientes veem seus pedidos de impressão"
  ON pedidos_impressao FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedidos_impressao.pedido_id
      AND p.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parceiros veem pedidos direcionados a eles" ON pedidos_impressao;
CREATE POLICY "Parceiros veem pedidos direcionados a eles"
  ON pedidos_impressao FOR SELECT
  USING (parceiro_id IN (
    SELECT id FROM parceiros WHERE user_id = auth.uid()
  ));

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tabelas de parceiros e geolocalização criadas/atualizadas com sucesso!';
  RAISE NOTICE 'Tabelas: parceiros (atualizada), pedidos_impressao, ranking_historico, disponibilidade_parceiros';
  RAISE NOTICE 'Funções: buscar_parceiros_proximos, atualizar_ranking_parceiro';
  RAISE NOTICE 'Extensão PostGIS habilitada';
END $$;
