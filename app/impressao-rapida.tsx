import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import * as DocumentPicker from 'expo-document-picker';
import { MapaParceiros } from '../components/MapaParceiros';
import { AguardandoAceite } from '../components/AguardandoAceite';
import { TelaPagamento } from '../components/TelaPagamento';
import { QRCodeRetirada } from '../components/QRCodeRetirada';
import { PreviewDocumento } from '../components/PreviewDocumento';
import { SeletorPaginasVisual } from '../components/SeletorPaginasVisual';
import { countPagesViaServer, parsePagesToPrint, validatePageRange } from '../lib/uploadUtils';
import { calcularPrecoTotal, getPrecoPorPagina, getRegraDescontoVolume } from '../lib/pricingUtils';
import { supabase } from '../lib/supabase';

type TipoImpressao = 'documentos' | 'fotos';
type TipoPapel = 'comum' | 'fotografico' | 'cartao';
type TamanhoFoto = '10x15' | '13x18' | '15x21' | '21x29';
type CategoriaServicoFoto = 'revelacao_fotos' | 'impressao_imagens_sulfite';
type LayoutImagemFolha = 1 | 2 | 4;

function parseRangeStringToArray(range: string, total: number): number[] {
  if (!range.trim()) return [];
  const pages: number[] = [];
  for (const part of range.split(/[,;]/)) {
    const t = part.trim();
    const m = t.match(/^(\d+)-(\d+)$/);
    if (m) {
      for (let i = parseInt(m[1]); i <= Math.min(parseInt(m[2]), total); i++) pages.push(i);
    } else {
      const n = parseInt(t);
      if (n >= 1 && n <= total) pages.push(n);
    }
  }
  return [...new Set(pages)].sort((a, b) => a - b);
}

// Interface PrintFile conforme documento técnico de referência
interface Arquivo {
  id: string;
  uri: string;
  name: string;
  size: number;
  tipo: 'pdf' | 'word' | 'powerpoint' | 'imagem';
  mimeType: string;
  pageCount: number;        // Total detectado pelo servidor
  pagesToPrint: number;     // Total efetivo após aplicar pageRange
  loading: boolean;         // Indicador de processamento
  message: string;          // Mensagem de status
}

interface ConfigImpressao {
  colorido: boolean;
  papel: TipoPapel;
  copias: number;
  pageRange: string;        // Intervalo de páginas (ex: "1-3, 5, 8-10")
  tamanhoFoto?: TamanhoFoto;
  layoutImagemFolha?: LayoutImagemFolha;
}

type EtapaFluxo = 'selecao_tipo' | 'upload' | 'selecao_parceiro' | 'aguardando_aceite' | 'pagamento' | 'qrcode';

interface ParceiroSelecionado {
  id: string;
  nome_completo: string;
  endereco_completo: string;
  distancia_metros: number;
  ranking_score: number;
  fila_atual: number;
  tempo_estimado_fila: number;
  latitude: number;
  longitude: number;
}

interface ResumoDesconto {
  totalSemDesconto: number;
  totalComDesconto: number;
  economia: number;
  precoBasePb: number;
  precoBaseColorido: number;
  precoAtualPb: number | null;
  precoAtualColorido: number | null;
  paginasPb: number;
  paginasColorido: number;
  descontoAtivo: boolean;
  minPaginasDesconto: number | null;
  paginasFaltantes: number;
  aplicaDesconto: boolean;
}

export default function ImpressaoRapida() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<EtapaFluxo>('selecao_tipo');
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoImpressao | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [configs, setConfigs] = useState<Record<string, ConfigImpressao>>({});
  const [mensagem, setMensagem] = useState('');
  const [parceiroSelecionado, setParceiroSelecionado] = useState<ParceiroSelecionado | null>(null);
  const [pedidoImpressaoId, setPedidoImpressaoId] = useState<string | null>(null);
  const [numeroPedido, setNumeroPedido] = useState<string>('');
  const [horarioEstimado, setHorarioEstimado] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [arquivoPreview, setArquivoPreview] = useState<Arquivo | null>(null);
  const [precoTotal, setPrecoTotal] = useState<number>(0);
  const [resumoDesconto, setResumoDesconto] = useState<ResumoDesconto | null>(null);
  const [categoriaServicoFoto, setCategoriaServicoFoto] = useState<CategoriaServicoFoto>('revelacao_fotos');
  const [layoutGlobalSulfite, setLayoutGlobalSulfite] = useState<LayoutImagemFolha>(1);

  // Recalcular preço automaticamente quando arquivos ou configs mudarem
  useEffect(() => {
    async function atualizarPreco() {
      const preco = await calcularPreco();
      setPrecoTotal(preco);

      const resumo = await calcularResumoDescontoVolume();
      setResumoDesconto(resumo);
    }
    atualizarPreco();
  }, [arquivos, configs, tipoSelecionado, categoriaServicoFoto, layoutGlobalSulfite]);

  async function calcularResumoDescontoVolume(): Promise<ResumoDesconto | null> {
    const isSulfite = tipoSelecionado === 'fotos' && categoriaServicoFoto === 'impressao_imagens_sulfite';
    if (tipoSelecionado !== 'documentos' && !isSulfite) {
      return null;
    }

    let paginasPb = 0;
    let paginasColorido = 0;
    let totalEspecial = 0;

    if (isSulfite) {
      paginasColorido = calcularTotalFolhasSulfite();
    } else {
      for (const arquivo of arquivos) {
        const config = configs[arquivo.id];
        if (!config) continue;

        const pagesToPrint = config.pageRange
          ? parsePagesToPrint(config.pageRange, arquivo.pageCount)
          : arquivo.pageCount;
        const paginasComCopias = pagesToPrint * config.copias;

        if (config.papel === 'comum') {
          if (config.colorido) {
            paginasColorido += paginasComCopias;
          } else {
            paginasPb += paginasComCopias;
          }
        } else {
          const precoEspecial = config.papel === 'cartao'
            ? (config.colorido ? 3.5 : 3.0)
            : 4.0;
          totalEspecial += paginasComCopias * precoEspecial;
        }
      }
    }

    if (paginasPb === 0 && paginasColorido === 0) {
      return null;
    }

    const [precoBasePb, precoBaseColorido] = await Promise.all([
      getPrecoPorPagina('pb', 1),
      getPrecoPorPagina('colorido', 1),
    ]);

    const [precoAtualPb, precoAtualColorido] = await Promise.all([
      paginasPb > 0 ? getPrecoPorPagina('pb', paginasPb) : Promise.resolve(null),
      paginasColorido > 0 ? getPrecoPorPagina('colorido', paginasColorido) : Promise.resolve(null),
    ]);

    const totalSemDesconto =
      (paginasPb * precoBasePb) +
      (paginasColorido * precoBaseColorido) +
      totalEspecial;

    const totalComDesconto =
      (paginasPb * (precoAtualPb ?? precoBasePb)) +
      (paginasColorido * (precoAtualColorido ?? precoBaseColorido)) +
      totalEspecial;

    const regraDesconto = await getRegraDescontoVolume();
    const totalPaginasComuns = paginasPb + paginasColorido;
    const paginasFaltantes = regraDesconto.ativo && regraDesconto.minPaginas !== null
      ? Math.max(0, regraDesconto.minPaginas - totalPaginasComuns)
      : 0;
    const economia = Math.max(0, totalSemDesconto - totalComDesconto);

    return {
      totalSemDesconto,
      totalComDesconto,
      economia,
      precoBasePb,
      precoBaseColorido,
      precoAtualPb,
      precoAtualColorido,
      paginasPb,
      paginasColorido,
      descontoAtivo: regraDesconto.ativo,
      minPaginasDesconto: regraDesconto.minPaginas,
      paginasFaltantes,
      aplicaDesconto: economia > 0,
    };
  }

  async function selecionarArquivos() {
    try {
      let tiposAceitos: string[] = [];
      
      if (tipoSelecionado === 'documentos') {
        tiposAceitos = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
      } else if (tipoSelecionado === 'fotos') {
        tiposAceitos = ['image/jpeg', 'image/jpg', 'image/png'];
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: tiposAceitos,
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets) {
        // UX Assíncrona: Arquivos aparecem imediatamente com loading
        const arquivosIniciais = result.assets.map((asset: any) => {
          const nome = (asset.name || '').toLowerCase();
          const mime = (asset.mimeType || '').toLowerCase();
          const tipo: 'pdf' | 'word' | 'powerpoint' | 'imagem' = 
            mime.includes('pdf') || nome.endsWith('.pdf') ? 'pdf' :
            mime.includes('word') || mime.includes('wordprocessing') || nome.endsWith('.doc') || nome.endsWith('.docx') ? 'word' :
            mime.includes('powerpoint') || mime.includes('presentation') || nome.endsWith('.ppt') || nome.endsWith('.pptx') ? 'powerpoint' :
            'imagem';

          const isImagem = tipo === 'imagem';

          return {
            id: `${Date.now()}_${Math.random()}`,
            uri: asset.uri,
            name: asset.name || 'arquivo_sem_nome',
            size: asset.size ?? 0,
            tipo,
            mimeType: asset.mimeType || '',
            pageCount: isImagem ? 1 : 0,
            pagesToPrint: isImagem ? 1 : 0,
            loading: !isImagem,
            message: isImagem ? 'Pronto' : 'Contando páginas...',
          };
        });

        setArquivos(prev => [...prev, ...arquivosIniciais]);

        // Processar contagem de páginas em background
        result.assets.forEach(async (asset: any, index: number) => {
          const arquivo = arquivosIniciais[index];
          
          if (arquivo.tipo !== 'imagem') {
            console.log(`📤 [SERVER] Enviando ${asset.name} para contagem...`);
            
            try {
              const pageCount = await countPagesViaServer(
                asset.uri,
                asset.name || 'arquivo_sem_nome',
                asset.mimeType || ''
              );
              
              // Atualizar arquivo com contagem recebida
              setArquivos(prev => prev.map(a => 
                a.id === arquivo.id ? {
                  ...a,
                  pageCount,
                  pagesToPrint: pageCount,
                  loading: false,
                  message: `${pageCount} página${pageCount !== 1 ? 's' : ''} detectada${pageCount !== 1 ? 's' : ''}`,
                } : a
              ));

              console.log(`✅ [SERVER] ${asset.name}: ${pageCount} páginas`);
            } catch (error) {
              console.warn(`⚠️ [SERVER] Falha pontual na contagem de ${asset.name}, aplicando fallback local`);
              
              // Fallback: usar 1 página
              setArquivos(prev => prev.map(a => 
                a.id === arquivo.id ? {
                  ...a,
                  pageCount: 1,
                  pagesToPrint: 1,
                  loading: false,
                  message: '1 página detectada',
                } : a
              ));
            }
          }
        });

        // Configurações iniciais
        const novasConfigs = { ...configs };
        arquivosIniciais.forEach(arquivo => {
          if (!novasConfigs[arquivo.id]) {
            novasConfigs[arquivo.id] = {
              colorido: true, // Colorido por padrão
              papel: tipoSelecionado === 'fotos' ? getTipoPapelCategoriaFoto(categoriaServicoFoto) : 'comum',
              copias: 1,
              pageRange: '', // Vazio = todas as páginas
              tamanhoFoto: tipoSelecionado === 'fotos' && categoriaServicoFoto === 'revelacao_fotos' ? '10x15' : undefined,
              layoutImagemFolha: tipoSelecionado === 'fotos' ? 1 : undefined,
            };
          }
        });
        setConfigs(novasConfigs);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivos:', error);
      Alert.alert('Erro', 'Não foi possível selecionar os arquivos');
    }
  }

  function removerArquivo(id: string) {
    setArquivos(arquivos.filter(a => a.id !== id));
    const novasConfigs = { ...configs };
    delete novasConfigs[id];
    setConfigs(novasConfigs);
  }

  function abrirPreview(arquivo: Arquivo) {
    setArquivoPreview(arquivo);
    setPreviewVisible(true);
  }

  function getTipoPapelCategoriaFoto(categoria: CategoriaServicoFoto): TipoPapel {
    return categoria === 'revelacao_fotos' ? 'fotografico' : 'comum';
  }

  function calcularFolhasImagem(config: ConfigImpressao): number {
    const layout = config.layoutImagemFolha || 1;
    return Math.max(1, Math.ceil(config.copias / layout));
  }

  function calcularTotalFolhasSulfite(): number {
    if (categoriaServicoFoto !== 'impressao_imagens_sulfite') return 0;
    const n = arquivos.filter(a => a.tipo === 'imagem').length;
    return n === 0 ? 0 : Math.ceil(n / layoutGlobalSulfite);
  }

  function atualizarCategoriaFoto(categoria: CategoriaServicoFoto) {
    setCategoriaServicoFoto(categoria);
    setConfigs((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((id) => {
        const atual = next[id];
        next[id] = {
          ...atual,
          papel: getTipoPapelCategoriaFoto(categoria),
          tamanhoFoto: categoria === 'revelacao_fotos' ? (atual.tamanhoFoto || '10x15') : undefined,
          layoutImagemFolha: categoria === 'impressao_imagens_sulfite' ? (atual.layoutImagemFolha || 1) : undefined,
        };
      });

      return next;
    });
  }

  // Cálculo de preço reativo com desconto progressivo
  async function calcularPreco(): Promise<number> {
    if (tipoSelecionado === 'documentos') {
      const arquivosParaCalculo = arquivos.map(arquivo => {
        const config = configs[arquivo.id];
        if (!config) return null;
        
        // Calcular pagesToPrint baseado em pageRange
        const pagesToPrint = config.pageRange 
          ? parsePagesToPrint(config.pageRange, arquivo.pageCount)
          : arquivo.pageCount;
        
        return {
          pagesToPrint,
          copies: config.copias,
          colorMode: config.colorido ? 'colorido' as const : 'pb' as const,
          papel: config.papel,
        };
      }).filter(Boolean) as Array<{ pagesToPrint: number; copies: number; colorMode: 'pb' | 'colorido'; papel: TipoPapel }>;

      const arquivosComDesconto = arquivosParaCalculo
        .filter(a => a.papel === 'comum')
        .map(({ pagesToPrint, copies, colorMode }) => ({ pagesToPrint, copies, colorMode }));

      const totalComDesconto = arquivosComDesconto.length > 0
        ? (await calcularPrecoTotal(arquivosComDesconto)).total
        : 0;

      const totalPapeisEspeciais = arquivosParaCalculo
        .filter(a => a.papel !== 'comum')
        .reduce((sum, a) => {
          const precoPorPagina = a.papel === 'cartao'
            ? (a.colorMode === 'colorido' ? 3.5 : 3.0)
            : 4.0;

          return sum + (a.pagesToPrint * a.copies * precoPorPagina);
        }, 0);

      return totalComDesconto + totalPapeisEspeciais;
    } else if (tipoSelecionado === 'fotos') {
      if (categoriaServicoFoto === 'impressao_imagens_sulfite') {
        const folhas = calcularTotalFolhasSulfite();
        if (folhas === 0) return 0;
        const resultado = await calcularPrecoTotal([{ pagesToPrint: folhas, copies: 1, colorMode: 'colorido' }]);
        return resultado.total;
      }
      let total = 0;
      arquivos.forEach(arquivo => {
        const config = configs[arquivo.id];
        if (!config) return;

        const precoRevelacao = ({ '10x15': 3, '13x18': 5, '15x21': 7, '21x29': 10 } as const)[config.tamanhoFoto || '10x15'];
        total += precoRevelacao * config.copias;
      });
      return total;
    }
    
    return 0;
  }

  async function handleProsseguir() {
    if (arquivos.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um arquivo para imprimir');
      return;
    }

    // Verificar se há arquivos ainda carregando
    const arquivosCarregando = arquivos.filter(a => a.loading);
    if (arquivosCarregando.length > 0) {
      Alert.alert('Aguarde', 'Ainda estamos contando as páginas de alguns arquivos...');
      return;
    }

    // Validar intervalos de páginas
    for (const arquivo of arquivos) {
      const config = configs[arquivo.id];
      if (config && config.pageRange) {
        const resultado = validatePageRange(config.pageRange, arquivo.pageCount);
        if (!resultado.valid) {
          Alert.alert('Páginas Inválidas', resultado.message || 'Formato inválido');
          return;
        }
      }
    }

    setEtapa('selecao_parceiro');
  }

  async function handleParceiroSelecionado(parceiro: ParceiroSelecionado) {
    try {
      console.log('📍 Parceiro selecionado:', parceiro);
      setParceiroSelecionado(parceiro);

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        Alert.alert('Sessão expirada', 'Faça login novamente para continuar.');
        router.push('/(auth)/login');
        return;
      }

      const totalPaginas = arquivos.reduce((sum, a) => {
        const config = configs[a.id];
        const pagesToPrint = config?.pageRange 
          ? parsePagesToPrint(config.pageRange, a.pageCount)
          : a.pageCount;
        return sum + (pagesToPrint * (config?.copias || 1));
      }, 0);
      const preco = await calcularPreco();
      setPrecoTotal(preco);

      console.log('💰 Total páginas:', totalPaginas, 'Preço:', preco.toFixed(2));

      const arquivosPedido = arquivos.map((a) => {
        const config = configs[a.id];
        const pagesToPrint = config?.pageRange
          ? parsePagesToPrint(config.pageRange, a.pageCount)
          : a.pageCount;

        return {
          nome: a.name,
          tipo: a.tipo,
          mimeType: a.mimeType,
          pageCount: a.pageCount,
          pagesToPrint,
          copias: config?.copias || 1,
          colorido: config?.colorido || false,
          papel: config?.papel || 'comum',
          pageRange: config?.pageRange || '',
          tamanhoFoto: config?.tamanhoFoto || null,
          layoutImagemFolha: config?.layoutImagemFolha || null,
          totalFolhasCalculado:
            tipoSelecionado === 'fotos' && categoriaServicoFoto === 'impressao_imagens_sulfite' && config
              ? calcularFolhasImagem(config)
              : null,
        };
      });

      const totalFolhasCalculadoPedido =
        tipoSelecionado === 'fotos' && categoriaServicoFoto === 'impressao_imagens_sulfite'
          ? calcularTotalFolhasSulfite()
          : null;
      const layoutEscolhidoPedido =
        tipoSelecionado === 'fotos' && categoriaServicoFoto === 'impressao_imagens_sulfite'
          ? layoutGlobalSulfite
          : null;

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: userId,
          parceiro_id: parceiro.id,
          servico_id: null,
          tipo_servico: 'faca_voce_mesmo',
          dados_formulario: {
            origem: 'impressao_rapida',
            tipoSelecionado,
            categoriaServicoFoto: tipoSelecionado === 'fotos' ? categoriaServicoFoto : null,
            tipoPapelFoto: tipoSelecionado === 'fotos' ? getTipoPapelCategoriaFoto(categoriaServicoFoto) : null,
            layoutEscolhido: layoutEscolhidoPedido,
            totalFolhasCalculado: totalFolhasCalculadoPedido,
            totalPaginas,
            mensagem,
            arquivos: arquivosPedido,
          },
          categoria_servico: tipoSelecionado === 'fotos' ? categoriaServicoFoto : null,
          tipo_papel: tipoSelecionado === 'fotos' ? getTipoPapelCategoriaFoto(categoriaServicoFoto) : null,
          layout_escolhido: layoutEscolhidoPedido,
          total_folhas_calculado: totalFolhasCalculadoPedido,
          valor_total: preco,
          valor_desconto: resumoDesconto?.economia || 0,
          valor_final: preco,
          status: 'aguardando_pagamento',
          status_pagamento: 'pendente',
          metodo_pagamento: 'pix',
          observacoes: mensagem || null,
        })
        .select('id, numero_pedido')
        .single();

      if (pedidoError) {
        throw pedidoError;
      }

      setPedidoImpressaoId(pedido.id);
      setNumeroPedido(pedido.numero_pedido || '');
      
      console.log('✅ Indo para aguardando aceite');
      setEtapa('aguardando_aceite');
      
      // Simular aceite automático após 2 segundos para teste
      setTimeout(() => {
        console.log('✅ Simulando aceite do parceiro');
        handleAceito();
      }, 2000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao selecionar parceiro:', error);
      Alert.alert('Erro', `Não foi possível continuar: ${errorMessage}`);
    }
  }

  function handleAceito() {
    if (!numeroPedido) {
      const numero = `IMP${Date.now().toString().slice(-8)}`;
      setNumeroPedido(numero);
    }

    const tempoTotal = 15 + (parceiroSelecionado?.tempo_estimado_fila || 0);
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + tempoTotal);
    setHorarioEstimado(agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

    // Ir para pagamento primeiro
    console.log('✅ Parceiro aceitou - indo para pagamento');
    setEtapa('pagamento');
  }

  async function handlePagamentoConcluido() {
    if (pedidoImpressaoId) {
      const { error } = await supabase
        .from('pedidos')
        .update({
          status_pagamento: 'aprovado',
          status: 'pagamento_confirmado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pedidoImpressaoId);

      if (error) {
        console.warn('⚠️ Falha ao atualizar status do pagamento no pedido:', error);
      }
    }

    console.log('✅ Pagamento concluído - gerando QR Code');
    setEtapa('qrcode');
  }

  function handleRecusado() {
    Alert.alert(
      'Parceiro Recusou',
      'Desculpe pelo inconveniente. Escolha outro parceiro para retirar sua impressão.',
      [{ text: 'OK', onPress: () => setEtapa('selecao_parceiro') }]
    );
  }

  function handleTimeout() {
    Alert.alert(
      'Tempo Esgotado',
      'O parceiro não respondeu em 5 minutos. Escolha outro parceiro.',
      [{ text: 'OK', onPress: () => setEtapa('selecao_parceiro') }]
    );
  }

  // Etapa: Seleção de Parceiro
  if (etapa === 'selecao_parceiro' && parceiroSelecionado === null) {
    return (
      <View style={{ flex: 1 }}>
        <MapaParceiros
          onParceiroSelecionado={handleParceiroSelecionado}
          onVoltar={() => setEtapa('upload')}
          precisaImpressora={true}
          raioKm={10}
        />
      </View>
    );
  }

  // Etapa: Aguardando Aceite
  if (etapa === 'aguardando_aceite' && pedidoImpressaoId && parceiroSelecionado) {
    return (
      <AguardandoAceite
        pedidoImpressaoId={pedidoImpressaoId}
        parceiroNome={parceiroSelecionado.nome_completo}
        onAceito={handleAceito}
        onRecusado={handleRecusado}
        onTimeout={handleTimeout}
        timeoutSegundos={300}
      />
    );
  }

  // Etapa: Pagamento
  if (etapa === 'pagamento') {
    return (
      <TelaPagamento
        valorTotal={precoTotal}
        numeroPedido={numeroPedido}
        onPagamentoConcluido={handlePagamentoConcluido}
      />
    );
  }

  // Etapa: QR Code
  if (etapa === 'qrcode' && parceiroSelecionado) {
    return (
      <ScrollView style={{ flex: 1 }}>
        <QRCodeRetirada
          numeroPedido={numeroPedido}
          parceiroNome={parceiroSelecionado.nome_completo}
          parceiroEndereco={parceiroSelecionado.endereco_completo}
          horarioEstimado={horarioEstimado}
          filaAtual={parceiroSelecionado.fila_atual}
          parceiroLatitude={parceiroSelecionado.latitude}
          parceiroLongitude={parceiroSelecionado.longitude}
        />
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/home')}
            style={{ backgroundColor: '#10B981', padding: 18, borderRadius: 16, elevation: 4 }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
              Voltar para Início
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Etapa: Seleção de Tipo
  if (etapa === 'selecao_tipo') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
        <View style={{ backgroundColor: '#10B981', padding: 24, paddingTop: 40, paddingBottom: 30, elevation: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="print" size={64} color="#fff" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>🖨️ Impressão Rápida</Text>
            <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>Escolha o tipo de impressão</Text>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={() => { setTipoSelecionado('documentos'); setEtapa('upload'); }}
            style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 16, elevation: 4, borderLeftWidth: 4, borderLeftColor: '#3B82F6' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="document-text" size={40} color="#3B82F6" />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary }}>📄 Documentos</Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary, marginTop: 4 }}>PDF, Word, PowerPoint</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              P&B: R$ 1,00/pág • Colorido: R$ 1,50/pág{'\n'}
              Cartão: R$ 3,00/pág • Fotográfico: R$ 4,00/pág
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setTipoSelecionado('fotos'); setCategoriaServicoFoto('revelacao_fotos'); setEtapa('upload'); }}
            style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 16, elevation: 4, borderLeftWidth: 4, borderLeftColor: '#8B5CF6' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="images" size={40} color="#8B5CF6" />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary }}>📸 Fotos</Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary, marginTop: 4 }}>Papel fotográfico</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
            </View>
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              10x15: R$ 3,00 • 13x18: R$ 5,00{'\n'}
              15x21: R$ 7,00 • 21x29: R$ 10,00
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3B82F6' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 }}>💡 Como funciona</Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              1. Escolha o tipo de impressão{'\n'}
              2. Faça upload dos arquivos{'\n'}
              3. Configure as opções{'\n'}
              4. Escolha o parceiro mais próximo{'\n'}
              5. Retire na loja com QR Code
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Etapa: Upload e Configuração
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <ScrollView>
        <View style={{ backgroundColor: '#10B981', padding: 24, paddingTop: 40, paddingBottom: 30, elevation: 8 }}>
          <TouchableOpacity
            onPress={() => { setTipoSelecionado(null); setEtapa('selecao_tipo'); }}
            style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
            {tipoSelecionado === 'documentos' ? '📄 Documentos' : '📸 Fotos'}
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
            {arquivos.length} arquivo(s) • {arquivos.reduce((sum, a) => {
              const config = configs[a.id];
              const pagesToPrint = config?.pageRange ? parsePagesToPrint(config.pageRange, a.pageCount) : a.pageCount;
              return sum + pagesToPrint;
            }, 0)} página(s)
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={selecionarArquivos}
            style={{ backgroundColor: '#10B981', padding: 18, borderRadius: 16, marginBottom: 20, elevation: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="cloud-upload" size={24} color="#fff" style={{ marginRight: 12 }} />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Adicionar Arquivos</Text>
          </TouchableOpacity>

          {tipoSelecionado === 'fotos' && (
            <View style={{ backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Como imprimir as imagens?</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => atualizarCategoriaFoto('revelacao_fotos')}
                  style={{ flex: 1, marginRight: 8, padding: 10, borderRadius: 8, backgroundColor: categoriaServicoFoto === 'revelacao_fotos' ? '#10B981' : '#E5E7EB' }}
                >
                  <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: categoriaServicoFoto === 'revelacao_fotos' ? '#fff' : Colors.text.secondary }}>Revelação</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => atualizarCategoriaFoto('impressao_imagens_sulfite')}
                  style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: categoriaServicoFoto === 'impressao_imagens_sulfite' ? '#10B981' : '#E5E7EB' }}
                >
                  <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: categoriaServicoFoto === 'impressao_imagens_sulfite' ? '#fff' : Colors.text.secondary }}>Imagem na sulfite</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {tipoSelecionado === 'fotos' && categoriaServicoFoto === 'impressao_imagens_sulfite' && (
            <View style={{ backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>Layout (todas as imagens):</Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
                {arquivos.filter(a => a.tipo === 'imagem').length} foto(s) → {Math.max(1, Math.ceil(arquivos.filter(a => a.tipo === 'imagem').length / layoutGlobalSulfite))} folha(s) A4
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {([1, 2, 4] as LayoutImagemFolha[]).map(l => (
                  <TouchableOpacity key={l} onPress={() => setLayoutGlobalSulfite(l)}
                    style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: layoutGlobalSulfite === l ? '#10B981' : '#E5E7EB', marginRight: l < 4 ? 8 : 0, alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: layoutGlobalSulfite === l ? '#fff' : '#6B7280' }}>{l}/folha</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Ilustração visual do layout selecionado */}
              <View style={{ alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>Prévia do layout na folha A4:</Text>
                <View style={{ width: 80, height: 110, backgroundColor: '#F3F4F6', borderRadius: 4, borderWidth: 1, borderColor: '#D1D5DB', padding: 5,
                  flexDirection: layoutGlobalSulfite === 1 ? 'column' : 'row', flexWrap: layoutGlobalSulfite === 4 ? 'wrap' : 'nowrap',
                  justifyContent: 'space-evenly', alignItems: 'center', alignContent: 'space-evenly' }}>
                  {Array.from({ length: layoutGlobalSulfite }).map((_, i) => (
                    <View key={i} style={{
                      backgroundColor: '#10B981',
                      borderRadius: 2,
                      opacity: 0.75,
                      width: layoutGlobalSulfite === 1 ? 58 : layoutGlobalSulfite === 2 ? 28 : 26,
                      height: layoutGlobalSulfite === 1 ? 85 : layoutGlobalSulfite === 2 ? 82 : 38,
                      margin: layoutGlobalSulfite === 4 ? 1 : 0,
                    }} />
                  ))}
                </View>
                <Text style={{ fontSize: 12, color: '#10B981', fontWeight: 'bold', marginTop: 6 }}>
                  {Math.max(1, Math.ceil(arquivos.filter(a => a.tipo === 'imagem').length / layoutGlobalSulfite))} impressão(ões) cobradas
                </Text>
              </View>
            </View>
          )}
          {/* Lista de Arquivos */}
          {arquivos.map((arquivo, index) => {
            const config = configs[arquivo.id];
            if (!config) return null;

            const paginasImprimir = config.pageRange 
              ? parsePagesToPrint(config.pageRange, arquivo.pageCount)
              : arquivo.pageCount;

            return (
              <View key={arquivo.id} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 }}>
                {/* Cabeçalho do Arquivo */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  {arquivo.loading ? (
                    <Ionicons name="hourglass" size={32} color="#F59E0B" />
                  ) : (
                    <Ionicons 
                      name={arquivo.tipo === 'pdf' ? 'document-text' : arquivo.tipo === 'word' ? 'document' : arquivo.tipo === 'powerpoint' ? 'easel' : 'image'} 
                      size={32} 
                      color={arquivo.tipo === 'pdf' ? '#EF4444' : arquivo.tipo === 'word' ? '#3B82F6' : arquivo.tipo === 'powerpoint' ? '#F59E0B' : '#10B981'} 
                    />
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary }} numberOfLines={1}>{arquivo.name}</Text>
                    <Text style={{ fontSize: 14, color: arquivo.loading ? '#F59E0B' : Colors.text.secondary }}>
                      {arquivo.message}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => abrirPreview(arquivo)} style={{ marginRight: 12 }} disabled={arquivo.loading}>
                    <Ionicons name="eye" size={24} color={arquivo.loading ? '#D1D5DB' : '#10B981'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removerArquivo(arquivo.id)}>
                    <Ionicons name="trash" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Configurações para Documentos */}
                {arquivo.tipo !== 'imagem' && (
                  <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Configurações:</Text>
                    
                    {/* Cor */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, colorido: false } })}
                        style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: !config.colorido ? '#10B981' : '#E5E7EB', marginRight: 8 }}
                      >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: !config.colorido ? '#fff' : Colors.text.secondary }}>
                          P&B
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, colorido: true } })}
                        style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: config.colorido ? '#10B981' : '#E5E7EB' }}
                      >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: config.colorido ? '#fff' : Colors.text.secondary }}>
                          Colorido
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Tipo de Papel */}
                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Tipo de Papel:</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                      {(['comum', 'cartao', 'fotografico'] as TipoPapel[]).map(tipo => (
                        <TouchableOpacity
                          key={tipo}
                          onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, papel: tipo } })}
                          style={{ flex: 1, padding: 8, borderRadius: 8, backgroundColor: config.papel === tipo ? '#10B981' : '#E5E7EB', marginRight: 4 }}
                        >
                          <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: config.papel === tipo ? '#fff' : Colors.text.secondary }}>
                            {tipo === 'comum' ? 'Comum' : tipo === 'cartao' ? 'Cartão' : 'Fotográfico'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Páginas Específicas */}
                    {arquivo.pageCount > 1 && (
                      <>
                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Páginas (ex: 1-3, 5, 7-10):</Text>
                        <TextInput
                          value={config.pageRange}
                          onChangeText={(text) => {
                            setConfigs({ ...configs, [arquivo.id]: { ...config, pageRange: text } });
                            const newPagesToPrint = text ? parsePagesToPrint(text, arquivo.pageCount) : arquivo.pageCount;
                            setArquivos(prev => prev.map(a => 
                              a.id === arquivo.id ? { ...a, pagesToPrint: newPagesToPrint } : a
                            ));
                          }}
                          placeholder="Todas as páginas"
                          style={{ backgroundColor: Colors.background.secondary, padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                          editable={!arquivo.loading}
                        />
                        {config.pageRange && (
                          <Text style={{ fontSize: 12, color: '#10B981', marginBottom: 4 }}>
                            ✓ {paginasImprimir} página(s) selecionada(s)
                          </Text>
                        )}
                        {!arquivo.loading && (
                          <SeletorPaginasVisual
                            totalPaginas={arquivo.pageCount}
                            paginasSelecionadas={parseRangeStringToArray(config.pageRange || '', arquivo.pageCount)}
                            onChange={(paginas, rangeStr) => {
                              setConfigs({ ...configs, [arquivo.id]: { ...config, pageRange: rangeStr } });
                              const newPagesToPrint = rangeStr ? parsePagesToPrint(rangeStr, arquivo.pageCount) : arquivo.pageCount;
                              setArquivos(prev => prev.map(a =>
                                a.id === arquivo.id ? { ...a, pagesToPrint: newPagesToPrint } : a
                              ));
                            }}
                          />
                        )}
                      </>
                    )}

                    {/* Cópias */}
                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Cópias:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, copias: Math.max(1, config.copias - 1) } })}
                        style={{ padding: 10, backgroundColor: '#E5E7EB', borderRadius: 8 }}
                        disabled={arquivo.loading}
                      >
                        <Ionicons name="remove" size={20} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 }}>{config.copias}</Text>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, copias: config.copias + 1 } })}
                        style={{ padding: 10, backgroundColor: '#10B981', borderRadius: 8 }}
                        disabled={arquivo.loading}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Configurações para Fotos */}
                {arquivo.tipo === 'imagem' && (
                  <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }}>
                    {categoriaServicoFoto === 'revelacao_fotos' ? (
                      <>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Tamanho:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                          {(['10x15', '13x18', '15x21', '21x29'] as TamanhoFoto[]).map(tamanho => (
                            <TouchableOpacity
                              key={tamanho}
                              onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, tamanhoFoto: tamanho } })}
                              style={{ padding: 10, borderRadius: 8, backgroundColor: config.tamanhoFoto === tamanho ? '#10B981' : '#E5E7EB', marginRight: 8, marginBottom: 8 }}
                            >
                              <Text style={{ fontWeight: 'bold', color: config.tamanhoFoto === tamanho ? '#fff' : Colors.text.secondary }}>
                                {tamanho}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    ) : (
                      <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                        Layout global: {layoutGlobalSulfite} imagem(ns)/folha
                      </Text>
                    )}

                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Cópias:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, copias: Math.max(1, config.copias - 1) } })}
                        style={{ padding: 10, backgroundColor: '#E5E7EB', borderRadius: 8 }}
                      >
                        <Ionicons name="remove" size={20} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 }}>{config.copias}</Text>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.id]: { ...config, copias: config.copias + 1 } })}
                        style={{ padding: 10, backgroundColor: '#10B981', borderRadius: 8 }}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Mensagem */}
          <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>💬 Mensagem para o parceiro (opcional)</Text>
            <TextInput
              value={mensagem}
              onChangeText={setMensagem}
              placeholder="Ex: Arquivo com senha 1234"
              multiline
              numberOfLines={3}
              style={{ backgroundColor: Colors.background.secondary, padding: 12, borderRadius: 8, fontSize: 14, textAlignVertical: 'top' }}
            />
          </View>

          {/* Resumo */}
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 4, borderWidth: 2, borderColor: '#10B981' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>💰 Resumo</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: Colors.text.secondary }}>Total de páginas:</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                {arquivos.reduce((sum, a) => {
                  const config = configs[a.id];
                  const pagesToPrint = config?.pageRange ? parsePagesToPrint(config.pageRange, a.pageCount) : a.pageCount;
                  return sum + pagesToPrint;
                }, 0)}
              </Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 12 }}>
              {resumoDesconto && resumoDesconto.aplicaDesconto && (
                <View style={{
                  backgroundColor: '#ECFDF5',
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#10B981',
                }}>
                  <Text style={{ fontSize: 13, color: '#065F46', fontWeight: '700', marginBottom: 6 }}>
                    🎯 Vantagem por volume
                  </Text>

                  {resumoDesconto.paginasColorido > 0 && resumoDesconto.precoAtualColorido !== null && (
                    <Text style={{ fontSize: 12, color: '#065F46', marginBottom: 3 }}>
                      Colorido: R$ {resumoDesconto.precoBaseColorido.toFixed(2).replace('.', ',')}/pág → R$ {resumoDesconto.precoAtualColorido.toFixed(2).replace('.', ',')}/pág ({resumoDesconto.paginasColorido} pág)
                    </Text>
                  )}

                  {resumoDesconto.paginasPb > 0 && resumoDesconto.precoAtualPb !== null && (
                    <Text style={{ fontSize: 12, color: '#065F46', marginBottom: 3 }}>
                      P&B: R$ {resumoDesconto.precoBasePb.toFixed(2).replace('.', ',')}/pág → R$ {resumoDesconto.precoAtualPb.toFixed(2).replace('.', ',')}/pág ({resumoDesconto.paginasPb} pág)
                    </Text>
                  )}

                  <Text style={{ fontSize: 12, color: '#065F46', marginTop: 6 }}>
                    Sem volume: R$ {resumoDesconto.totalSemDesconto.toFixed(2).replace('.', ',')} • Com volume: R$ {resumoDesconto.totalComDesconto.toFixed(2).replace('.', ',')}
                  </Text>

                  {resumoDesconto.economia > 0 && (
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#047857', marginTop: 6 }}>
                      Economia no pedido: R$ {resumoDesconto.economia.toFixed(2).replace('.', ',')}
                    </Text>
                  )}
                </View>
              )}

              {resumoDesconto && !resumoDesconto.aplicaDesconto && resumoDesconto.descontoAtivo && resumoDesconto.minPaginasDesconto !== null && (
                <View style={{
                  backgroundColor: '#EFF6FF',
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#3B82F6',
                }}>
                  <Text style={{ fontSize: 13, color: '#1E40AF', fontWeight: '700', marginBottom: 6 }}>
                    💡 Dica de economia
                  </Text>
                  <Text style={{ fontSize: 12, color: '#1E3A8A', lineHeight: 18 }}>
                    A partir de {resumoDesconto.minPaginasDesconto} páginas impressas, você recebe desconto por volume.
                    {resumoDesconto.paginasFaltantes > 0
                      ? ` Faltam ${resumoDesconto.paginasFaltantes} página(s) para liberar esse desconto.`
                      : ' Nesta quantidade o desconto pode variar conforme o tipo de impressão.'}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Valor Total:</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>
                  R$ {precoTotal.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View style={{ backgroundColor: '#fff', padding: 20, paddingBottom: 24, elevation: 12 }}>
        <TouchableOpacity
          onPress={handleProsseguir}
          style={{ backgroundColor: '#10B981', paddingVertical: 18, borderRadius: 16, elevation: 6 }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Escolher Parceiro 🚀
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Preview */}
      {arquivoPreview && (
        <PreviewDocumento
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          arquivo={arquivoPreview}
        />
      )}
    </View>
  );
}
