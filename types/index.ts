export type UserRole = 'cliente' | 'parceiro' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
  cpf?: string;
  telefone?: string;
  created_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  tipo: 'fazemos_pra_voce' | 'faca_voce_mesmo';
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Servico {
  id: string;
  categoria_id: string;
  nome: string;
  descricao?: string;
  descricao_curta?: string;
  icone?: string;
  preco_base?: number;
  preco_desconto?: number;
  percentual_desconto?: number;
  tempo_estimado?: string;
  requer_parceiro: boolean;
  requer_dados_cliente: boolean;
  campos_formulario?: any;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Loja {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  horario_funcionamento?: any;
  servicos_disponiveis?: string[];
  foto_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Parceiro {
  id: string;
  user_id: string;
  nome_completo: string;
  cpf: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  especialidades?: string[];
  documentos?: any;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso';
  motivo_rejeicao?: string;
  ranking: number;
  total_pedidos: number;
  pedidos_concluidos: number;
  taxa_conclusao: number;
  tempo_medio_resposta?: number;
  reclamacoes: number;
  data_aprovacao?: string;
  aprovado_por?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type StatusPedido = 
  | 'aguardando_pagamento'
  | 'pagamento_confirmado'
  | 'em_processamento'
  | 'aguardando_parceiro'
  | 'em_andamento'
  | 'aguardando_retirada'
  | 'concluido'
  | 'cancelado';

export type StatusPagamento = 'pendente' | 'aprovado' | 'recusado' | 'estornado';

export interface Pedido {
  id: string;
  numero_pedido: string;
  cliente_id: string;
  servico_id: string;
  parceiro_id?: string;
  loja_id?: string;
  tipo_servico: 'fazemos_pra_voce' | 'faca_voce_mesmo';
  dados_formulario: any;
  valor_total: number;
  valor_desconto: number;
  valor_final: number;
  status: StatusPedido;
  status_pagamento: StatusPagamento;
  metodo_pagamento: string;
  pix_qrcode?: string;
  pix_codigo?: string;
  pix_expiracao?: string;
  observacoes?: string;
  arquivos_gerados?: string[];
  data_conclusao?: string;
  avaliacao?: number;
  comentario_avaliacao?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoHistorico {
  id: string;
  pedido_id: string;
  status_anterior?: string;
  status_novo: string;
  observacao?: string;
  alterado_por?: string;
  created_at: string;
}

export interface MensagemSuporte {
  id: string;
  pedido_id: string;
  remetente_id: string;
  tipo_remetente: 'cliente' | 'parceiro' | 'admin' | 'sistema';
  mensagem: string;
  anexos?: string[];
  lida: boolean;
  created_at: string;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: any;
  descricao?: string;
  tipo: 'texto' | 'numero' | 'boolean' | 'json' | 'array';
  created_at: string;
  updated_at: string;
}

export interface Notificacao {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'pedido' | 'pagamento' | 'suporte' | 'sistema' | 'promocao';
  referencia_id?: string;
  lida: boolean;
  data_leitura?: string;
  created_at: string;
}
