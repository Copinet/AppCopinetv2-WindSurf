-- Adiciona campos para diferenciar revelação de fotos e impressão de imagens em sulfite
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS categoria_servico VARCHAR(60),
  ADD COLUMN IF NOT EXISTS tipo_papel VARCHAR(30),
  ADD COLUMN IF NOT EXISTS layout_escolhido SMALLINT,
  ADD COLUMN IF NOT EXISTS total_folhas_calculado INTEGER;

-- Índice opcional para filtros por categoria de serviço no fluxo de impressão rápida
CREATE INDEX IF NOT EXISTS idx_pedidos_categoria_servico ON public.pedidos(categoria_servico);
