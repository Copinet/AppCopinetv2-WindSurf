-- ============================================
-- TABELAS PARA SISTEMA DE PARCEIROS E GEOLOCALIZAÇÃO
-- FASE 3 - COPINET
-- Data: 27/02/2026
-- ============================================

-- ============================================
-- EXTENSÃO POSTGIS (para geolocalização)
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- TABELA: parceiros
-- ============================================
CREATE TABLE IF NOT EXISTS parceiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do Parceiro
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Endereço
  endereco_completo TEXT NOT NULL,
  cep TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  localizacao GEOGRAPHY(POINT, 4326), -- PostGIS para busca por raio
  
  -- Capacidades
  servicos_oferecidos JSONB DEFAULT '[]'::jsonb, -- Array de IDs de serviços
  tem_impressora BOOLEAN DEFAULT false,
  tipos_impressora JSONB DEFAULT '[]'::jsonb, -- ['pb', 'colorida', 'fotografica']
  
  -- Status e Disponibilidade
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_online BOOLEAN DEFAULT false,
  is_loja_propria BOOLEAN DEFAULT false,
  
  -- Ranking
  ranking_score INTEGER DEFAULT 100, -- 0-100
  total_pedidos INTEGER DEFAULT 0,
  total_aceitos INTEGER DEFAULT 0,
  total_recusados INTEGER DEFAULT 0,
  total_concluidos INTEGER DEFAULT 0,
  tempo_medio_resposta INTEGER, -- em segundos
  
  -- Horários de Funcionamento
  horario_funcionamento JSONB DEFAULT '{
    "segunda": {"abre": "08:00", "fecha": "18:00", "ativo": true},
    "terca": {"abre": "08:00", "fecha": "18:00", "ativo": true},
    "quarta": {"abre": "08:00", "fecha": "18:00", "ativo": true},
    "quinta": {"abre": "08:00", "fecha": "18:00", "ativo": true},
    "sexta": {"abre": "08:00", "fecha": "18:00", "ativo": true},
    "sabado": {"abre": "08:00", "fecha": "12:00", "ativo": false},
    "domingo": {"abre": "00:00", "fecha": "00:00", "ativo": false}
  }'::jsonb,
  
  -- Fila de Espera
  fila_atual INTEGER DEFAULT 0, -- Número de pedidos na fila
  tempo_estimado_fila INTEGER DEFAULT 0, -- em minutos
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_online_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_parceiros_user_id ON parceiros(user_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_status ON parceiros(status);
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
  arquivos JSONB NOT NULL, -- Array de arquivos com configs
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
  tempo_resposta INTEGER, -- em segundos
  
  -- QR Code
  qr_code_data TEXT,
  qr_code_gerado_em TIMESTAMP WITH TIME ZONE,
  
  -- Histórico de Tentativas
  tentativas JSONB DEFAULT '[]'::jsonb, -- Array de {parceiro_id, status, timestamp}
  
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
  pontos_alterados INTEGER NOT NULL, -- Pode ser negativo
  ranking_anterior INTEGER NOT NULL,
  ranking_novo INTEGER NOT NULL,
  
  -- Detalhes
  motivo TEXT,
  tempo_resposta INTEGER, -- em segundos
  
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
  distancia_metros DECIMAL,
  ranking INTEGER,
  fila INTEGER,
  tempo_estimado INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    ST_Distance(
      p.localizacao,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) as distancia,
    p.ranking_score,
    p.fila_atual,
    p.tempo_estimado_fila
  FROM parceiros p
  WHERE 
    p.status = 'approved'
    AND p.is_online = true
    AND ST_DWithin(
      p.localizacao,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      raio_km * 1000
    )
    AND (precisa_impressora = false OR p.tem_impressora = true)
    AND (servico_id IS NULL OR p.servicos_oferecidos @> to_jsonb(servico_id::text))
  ORDER BY 
    p.is_loja_propria DESC, -- Lojas próprias primeiro
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
        v_pontos_alteracao := v_pontos_alteracao + 1; -- Bônus por resposta rápida
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

CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON parceiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
CREATE POLICY "Parceiros podem ver seus próprios dados"
  ON parceiros FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parceiros podem atualizar seus próprios dados"
  ON parceiros FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Clientes podem ver parceiros aprovados"
  ON parceiros FOR SELECT
  USING (status = 'approved');

-- Políticas para pedidos_impressao
CREATE POLICY "Clientes veem seus pedidos de impressão"
  ON pedidos_impressao FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedidos_impressao.pedido_id
      AND p.cliente_id = auth.uid()
    )
  );

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
  RAISE NOTICE '✅ Tabelas de parceiros e geolocalização criadas com sucesso!';
  RAISE NOTICE 'Tabelas criadas: parceiros, pedidos_impressao, ranking_historico, disponibilidade_parceiros';
  RAISE NOTICE 'Funções criadas: buscar_parceiros_proximos, atualizar_ranking_parceiro';
  RAISE NOTICE 'Extensão PostGIS habilitada para geolocalização';
END $$;
