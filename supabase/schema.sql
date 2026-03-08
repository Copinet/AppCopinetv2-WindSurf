-- ============================================
-- COPINET SERVIÇOS DIGITAIS - SCHEMA DATABASE
-- Módulo 2: Sistema Completo
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABELA: CATEGORIAS DE SERVIÇOS
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  cor VARCHAR(20),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('fazemos_pra_voce', 'faca_voce_mesmo')),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: SERVIÇOS
-- ============================================
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  descricao_curta VARCHAR(300),
  icone VARCHAR(50),
  preco_base DECIMAL(10,2),
  preco_desconto DECIMAL(10,2),
  percentual_desconto INTEGER,
  tempo_estimado VARCHAR(50),
  requer_parceiro BOOLEAN DEFAULT false,
  requer_dados_cliente BOOLEAN DEFAULT true,
  campos_formulario JSONB,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: LOJAS COPINET
-- ============================================
CREATE TABLE IF NOT EXISTS lojas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  endereco TEXT NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(10),
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(100),
  localizacao GEOGRAPHY(POINT, 4326),
  horario_funcionamento JSONB,
  servicos_disponiveis TEXT[],
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: PARCEIROS
-- ============================================
CREATE TABLE IF NOT EXISTS parceiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  email VARCHAR(100) NOT NULL,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  localizacao GEOGRAPHY(POINT, 4326),
  especialidades TEXT[],
  documentos JSONB,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'suspenso')),
  motivo_rejeicao TEXT,
  ranking DECIMAL(3,2) DEFAULT 5.0,
  total_pedidos INTEGER DEFAULT 0,
  pedidos_concluidos INTEGER DEFAULT 0,
  taxa_conclusao DECIMAL(5,2) DEFAULT 0,
  tempo_medio_resposta INTEGER,
  reclamacoes INTEGER DEFAULT 0,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: PEDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_pedido VARCHAR(20) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id),
  parceiro_id UUID REFERENCES parceiros(id),
  loja_id UUID REFERENCES lojas(id),
  tipo_servico VARCHAR(50) NOT NULL CHECK (tipo_servico IN ('fazemos_pra_voce', 'faca_voce_mesmo')),
  dados_formulario JSONB NOT NULL,
  categoria_servico VARCHAR(60),
  tipo_papel VARCHAR(30),
  layout_escolhido SMALLINT,
  total_folhas_calculado INTEGER,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'aguardando_pagamento' CHECK (status IN (
    'aguardando_pagamento',
    'pagamento_confirmado',
    'em_processamento',
    'aguardando_parceiro',
    'em_andamento',
    'aguardando_retirada',
    'concluido',
    'cancelado'
  )),
  status_pagamento VARCHAR(50) DEFAULT 'pendente' CHECK (status_pagamento IN (
    'pendente',
    'aprovado',
    'recusado',
    'estornado'
  )),
  metodo_pagamento VARCHAR(50) DEFAULT 'pix',
  pix_qrcode TEXT,
  pix_codigo TEXT,
  pix_expiracao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  arquivos_gerados TEXT[],
  data_conclusao TIMESTAMP WITH TIME ZONE,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  comentario_avaliacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: HISTÓRICO DE STATUS DO PEDIDO
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50) NOT NULL,
  observacao TEXT,
  alterado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: MENSAGENS DE SUPORTE
-- ============================================
CREATE TABLE IF NOT EXISTS mensagens_suporte (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  remetente_id UUID REFERENCES auth.users(id),
  tipo_remetente VARCHAR(50) CHECK (tipo_remetente IN ('cliente', 'parceiro', 'admin', 'sistema')),
  mensagem TEXT NOT NULL,
  anexos TEXT[],
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: CONFIGURAÇÕES DO SISTEMA
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) CHECK (tipo IN ('texto', 'numero', 'boolean', 'json', 'array')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: NOTIFICAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('pedido', 'pagamento', 'suporte', 'sistema', 'promocao')),
  referencia_id UUID,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_servicos_categoria ON servicos(categoria_id);
CREATE INDEX idx_servicos_ativo ON servicos(ativo);
CREATE INDEX idx_parceiros_status ON parceiros(status);
CREATE INDEX idx_parceiros_user ON parceiros(user_id);
CREATE INDEX idx_parceiros_localizacao ON parceiros USING GIST(localizacao);
CREATE INDEX idx_lojas_localizacao ON lojas USING GIST(localizacao);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_parceiro ON pedidos(parceiro_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_created ON pedidos(created_at DESC);
CREATE INDEX idx_historico_pedido ON pedidos_historico(pedido_id);
CREATE INDEX idx_mensagens_pedido ON mensagens_suporte(pedido_id);
CREATE INDEX idx_notificacoes_user ON notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lojas_updated_at BEFORE UPDATE ON lojas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parceiros_updated_at BEFORE UPDATE ON parceiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de pedido único
CREATE OR REPLACE FUNCTION gerar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_pedido = 'COP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('pedidos_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence para número de pedido
CREATE SEQUENCE IF NOT EXISTS pedidos_seq START 1;

-- Trigger para gerar número de pedido
CREATE TRIGGER gerar_numero_pedido_trigger BEFORE INSERT ON pedidos
  FOR EACH ROW EXECUTE FUNCTION gerar_numero_pedido();

-- Função para registrar histórico de status
CREATE OR REPLACE FUNCTION registrar_historico_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO pedidos_historico (pedido_id, status_anterior, status_novo)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para histórico de status
CREATE TRIGGER registrar_historico_status_trigger AFTER UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION registrar_historico_status();

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_suporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias e serviços (leitura pública)
CREATE POLICY "Categorias são visíveis para todos" ON categorias FOR SELECT USING (ativo = true);
CREATE POLICY "Serviços são visíveis para todos" ON servicos FOR SELECT USING (ativo = true);
CREATE POLICY "Lojas são visíveis para todos" ON lojas FOR SELECT USING (ativo = true);

-- Políticas para parceiros
CREATE POLICY "Parceiros podem ver seus próprios dados" ON parceiros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Parceiros podem atualizar seus próprios dados" ON parceiros FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para pedidos
CREATE POLICY "Clientes podem ver seus próprios pedidos" ON pedidos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Parceiros podem ver pedidos atribuídos a eles" ON pedidos FOR SELECT USING (auth.uid() IN (SELECT user_id FROM parceiros WHERE id = pedidos.parceiro_id));
CREATE POLICY "Clientes podem criar pedidos" ON pedidos FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- Políticas para histórico de pedidos
CREATE POLICY "Histórico visível para donos do pedido" ON pedidos_historico FOR SELECT 
  USING (pedido_id IN (SELECT id FROM pedidos WHERE cliente_id = auth.uid() OR parceiro_id IN (SELECT id FROM parceiros WHERE user_id = auth.uid())));

-- Políticas para mensagens de suporte
CREATE POLICY "Mensagens visíveis para participantes" ON mensagens_suporte FOR SELECT
  USING (pedido_id IN (SELECT id FROM pedidos WHERE cliente_id = auth.uid() OR parceiro_id IN (SELECT id FROM parceiros WHERE user_id = auth.uid())));
CREATE POLICY "Usuários podem enviar mensagens" ON mensagens_suporte FOR INSERT
  WITH CHECK (auth.uid() = remetente_id);

-- Políticas para notificações
CREATE POLICY "Usuários veem suas próprias notificações" ON notificacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas notificações" ON notificacoes FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para configurações (apenas leitura para usuários autenticados)
CREATE POLICY "Configurações visíveis para autenticados" ON configuracoes FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, tipo) VALUES
  ('suporte_whatsapp_ativo', '{"ativo": true, "numero": "5513988813785"}'::jsonb, 'Configuração do suporte via WhatsApp', 'json'),
  ('suporte_chat_ativo', '{"ativo": true}'::jsonb, 'Configuração do chat interno', 'json'),
  ('taxa_desconto_faca_voce_mesmo', '{"percentual": 20}'::jsonb, 'Desconto para serviços Faça Você Mesmo', 'json'),
  ('mercado_pago_public_key', '{"key": ""}'::jsonb, 'Chave pública do Mercado Pago', 'json'),
  ('mercado_pago_access_token', '{"token": ""}'::jsonb, 'Access Token do Mercado Pago', 'json')
ON CONFLICT (chave) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categorias (nome, descricao, icone, cor, tipo, ordem) VALUES
  ('Certidões e Documentos', 'Antecedentes, TSE, Receita Federal e mais', 'document-text', '#3B82F6', 'fazemos_pra_voce', 1),
  ('MEI e Empresas', 'DAS, DASN, NFS-e, CCMEI', 'briefcase', '#F59E0B', 'fazemos_pra_voce', 2),
  ('Imposto de Renda', 'Declaração completa com Gov.br', 'cash', '#10B981', 'fazemos_pra_voce', 3),
  ('INSS e Benefícios', 'Aposentadoria, pensão, auxílios', 'shield-checkmark', '#8B5CF6', 'fazemos_pra_voce', 4),
  ('Currículos', 'Criação e atualização profissional', 'newspaper', '#EC4899', 'faca_voce_mesmo', 5),
  ('Contratos', 'Locação, compra/venda, serviços', 'document', '#06B6D4', 'faca_voce_mesmo', 6),
  ('Impressão', 'Documentos, fotos e mais', 'print', '#EF4444', 'fazemos_pra_voce', 7),
  ('Foto 3x4', 'Tire e edite sua foto', 'camera', '#14B8A6', 'faca_voce_mesmo', 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE categorias IS 'Categorias de serviços (Fazemos pra Você / Faça Você Mesmo)';
COMMENT ON TABLE servicos IS 'Serviços disponíveis no sistema';
COMMENT ON TABLE lojas IS 'Lojas físicas da Copinet';
COMMENT ON TABLE parceiros IS 'Parceiros credenciados para executar serviços';
COMMENT ON TABLE pedidos IS 'Pedidos de serviços dos clientes';
COMMENT ON TABLE pedidos_historico IS 'Histórico de mudanças de status dos pedidos';
COMMENT ON TABLE mensagens_suporte IS 'Mensagens do chat de suporte';
COMMENT ON TABLE configuracoes IS 'Configurações gerais do sistema';
COMMENT ON TABLE notificacoes IS 'Notificações push para usuários';
