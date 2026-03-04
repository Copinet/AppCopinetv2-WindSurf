-- Tabela de Preços com Desconto Progressivo
-- Conforme requisito do prompt mestre

-- Criar tabela de preços de impressão
CREATE TABLE IF NOT EXISTS precos_impressao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_impressao TEXT NOT NULL CHECK (tipo_impressao IN ('pb', 'colorido')),
  paginas_min INTEGER NOT NULL,
  paginas_max INTEGER,
  preco_por_pagina DECIMAL(10, 2) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir preços padrão para P&B
INSERT INTO precos_impressao (tipo_impressao, paginas_min, paginas_max, preco_por_pagina) VALUES
('pb', 1, 20, 1.00),
('pb', 21, 40, 0.90),
('pb', 41, 60, 0.70),
('pb', 61, NULL, 0.60);

-- Inserir preços padrão para Colorido
INSERT INTO precos_impressao (tipo_impressao, paginas_min, paginas_max, preco_por_pagina) VALUES
('colorido', 1, 20, 1.50),
('colorido', 21, 40, 1.20),
('colorido', 41, 60, 1.00),
('colorido', 61, NULL, 0.90);

-- Criar índice para consultas rápidas
CREATE INDEX idx_precos_tipo_paginas ON precos_impressao(tipo_impressao, paginas_min, paginas_max);

-- Função para obter preço por página baseado na quantidade
CREATE OR REPLACE FUNCTION obter_preco_por_pagina(
  p_tipo_impressao TEXT,
  p_total_paginas INTEGER
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_preco DECIMAL(10, 2);
BEGIN
  SELECT preco_por_pagina INTO v_preco
  FROM precos_impressao
  WHERE tipo_impressao = p_tipo_impressao
    AND ativo = true
    AND paginas_min <= p_total_paginas
    AND (paginas_max IS NULL OR paginas_max >= p_total_paginas)
  ORDER BY paginas_min DESC
  LIMIT 1;
  
  -- Fallback se não encontrar preço
  IF v_preco IS NULL THEN
    IF p_tipo_impressao = 'pb' THEN
      v_preco := 1.00;
    ELSE
      v_preco := 1.50;
    END IF;
  END IF;
  
  RETURN v_preco;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_precos_impressao_updated_at
BEFORE UPDATE ON precos_impressao
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE precos_impressao IS 'Tabela de preços com desconto progressivo por quantidade de páginas';
COMMENT ON COLUMN precos_impressao.tipo_impressao IS 'Tipo de impressão: pb (preto e branco) ou colorido';
COMMENT ON COLUMN precos_impressao.paginas_min IS 'Quantidade mínima de páginas para este preço';
COMMENT ON COLUMN precos_impressao.paginas_max IS 'Quantidade máxima de páginas (NULL = sem limite)';
COMMENT ON COLUMN precos_impressao.preco_por_pagina IS 'Preço por página em reais';
COMMENT ON FUNCTION obter_preco_por_pagina IS 'Retorna o preço por página baseado no tipo e quantidade total';
