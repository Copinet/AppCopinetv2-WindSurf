import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import * as DocumentPicker from 'expo-document-picker';
import { MapaParceiros } from '../components/MapaParceiros';
import { AguardandoAceite } from '../components/AguardandoAceite';
import { TelaPagamento } from '../components/TelaPagamento';
import { QRCodeRetirada } from '../components/QRCodeRetirada';
import { PreviewDocumento } from '../components/PreviewDocumento';
import { supabase } from '../lib/supabase';
import { contarPaginasPDF, contarPaginasWord, estimarPaginasPowerPoint, validarPaginasEspecificas, calcularPaginasImprimir } from '../lib/pdfUtils';

type TipoImpressao = 'documentos' | 'fotos';
type TipoPapel = 'comum' | 'fotografico' | 'cartao';
type TamanhoFoto = '10x15' | '13x18' | '15x21' | '21x29';

interface Arquivo {
  uri: string;
  name: string;
  size: number;
  tipo: 'pdf' | 'word' | 'powerpoint' | 'imagem';
  paginas: number;
  mimeType: string;
}

interface ConfigImpressao {
  colorido: boolean;
  papel: TipoPapel;
  copias: number;
  paginasEspecificas: string;
  tamanhoFoto?: TamanhoFoto;
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
        const novosArquivosPromises = result.assets.map(async (asset: any) => {
          let paginas = 1;
          let tipo: 'pdf' | 'word' | 'powerpoint' | 'imagem' = 'imagem';

          console.log(`📁 Processando arquivo: ${asset.name} (${asset.mimeType})`);

          if (asset.mimeType?.includes('pdf')) {
            tipo = 'pdf';
            console.log('🔄 Calculando páginas do PDF...');
            paginas = await contarPaginasPDF(asset.uri);
          } else if (asset.mimeType?.includes('word') || asset.mimeType?.includes('document')) {
            tipo = 'word';
            console.log('🔄 Calculando páginas do Word...');
            paginas = await contarPaginasWord(asset.uri, asset.size);
          } else if (asset.mimeType?.includes('powerpoint') || asset.mimeType?.includes('presentation')) {
            tipo = 'powerpoint';
            console.log('🔄 Estimando slides do PowerPoint...');
            paginas = estimarPaginasPowerPoint(asset.size);
          } else {
            tipo = 'imagem';
            paginas = 1;
          }

          return {
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            tipo,
            paginas,
            mimeType: asset.mimeType,
          };
        });

        const novosArquivos = await Promise.all(novosArquivosPromises);
        setArquivos([...arquivos, ...novosArquivos]);

        const novasConfigs = { ...configs };
        novosArquivos.forEach(arquivo => {
          if (!novasConfigs[arquivo.uri]) {
            novasConfigs[arquivo.uri] = {
              colorido: true,
              papel: tipoSelecionado === 'fotos' ? 'fotografico' : 'comum',
              copias: 1,
              paginasEspecificas: '',
              tamanhoFoto: tipoSelecionado === 'fotos' ? '10x15' : undefined,
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

  function removerArquivo(uri: string) {
    setArquivos(arquivos.filter(a => a.uri !== uri));
    const novasConfigs = { ...configs };
    delete novasConfigs[uri];
    setConfigs(novasConfigs);
  }

  function abrirPreview(arquivo: Arquivo) {
    setArquivoPreview(arquivo);
    setPreviewVisible(true);
  }

  function calcularPreco(): number {
    let total = 0;
    
    if (tipoSelecionado === 'documentos') {
      arquivos.forEach(arquivo => {
        const config = configs[arquivo.uri];
        if (!config) return;
        
        const paginasImprimir = calcularPaginasImprimir(arquivo.paginas, config.paginasEspecificas);
        let precoPorPagina = 0;

        if (config.papel === 'comum') {
          precoPorPagina = config.colorido ? 1.50 : 1.00;
        } else if (config.papel === 'cartao') {
          precoPorPagina = config.colorido ? 3.50 : 3.00;
        } else if (config.papel === 'fotografico') {
          precoPorPagina = 4.00;
        }
        
        total += paginasImprimir * config.copias * precoPorPagina;
      });
    } else if (tipoSelecionado === 'fotos') {
      arquivos.forEach(arquivo => {
        const config = configs[arquivo.uri];
        if (!config || !config.tamanhoFoto) return;

        const precosPorTamanho = {
          '10x15': 3.00,
          '13x18': 5.00,
          '15x21': 7.00,
          '21x29': 10.00,
        };

        total += precosPorTamanho[config.tamanhoFoto] * config.copias;
      });
    }
    
    return total;
  }

  async function handleProsseguir() {
    if (arquivos.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um arquivo para imprimir');
      return;
    }

    // Validar páginas específicas
    for (const arquivo of arquivos) {
      const config = configs[arquivo.uri];
      if (config && config.paginasEspecificas) {
        const resultado = validarPaginasEspecificas(config.paginasEspecificas, arquivo.paginas);
        if (!resultado.valido) {
          Alert.alert('Páginas Inválidas', resultado.mensagem || 'Formato inválido');
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

      const totalPaginas = arquivos.reduce((sum, a) => {
        const config = configs[a.uri];
        return sum + calcularPaginasImprimir(a.paginas, config?.paginasEspecificas || '');
      }, 0);
      const precoTotal = calcularPreco();

      console.log('💰 Total páginas:', totalPaginas, 'Preço:', precoTotal);

      // Por enquanto, pular criação de pedido no banco e ir direto para aceite
      // TODO: Implementar tabela pedidos_impressao corretamente
      const pedidoId = `temp_${Date.now()}`;
      setPedidoImpressaoId(pedidoId);
      
      console.log('✅ Indo para aguardando aceite');
      setEtapa('aguardando_aceite');
      
      // Simular aceite automático após 2 segundos para teste
      setTimeout(() => {
        console.log('✅ Simulando aceite do parceiro');
        handleAceito();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao selecionar parceiro:', error);
      Alert.alert('Erro', `Não foi possível continuar: ${error.message || 'Erro desconhecido'}`);
    }
  }

  function handleAceito() {
    const numero = `IMP${Date.now().toString().slice(-8)}`;
    setNumeroPedido(numero);

    const tempoTotal = 15 + (parceiroSelecionado?.tempo_estimado_fila || 0);
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + tempoTotal);
    setHorarioEstimado(agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

    // Ir para pagamento primeiro
    console.log('✅ Parceiro aceitou - indo para pagamento');
    setEtapa('pagamento');
  }

  function handlePagamentoConcluido() {
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
        valorTotal={calcularPreco()}
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
            onPress={() => { setTipoSelecionado('fotos'); setEtapa('upload'); }}
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
            {arquivos.length} arquivo(s) • {arquivos.reduce((sum, a) => sum + calcularPaginasImprimir(a.paginas, configs[a.uri]?.paginasEspecificas || ''), 0)} página(s)
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

          {/* Lista de Arquivos */}
          {arquivos.map((arquivo, index) => {
            const config = configs[arquivo.uri];
            if (!config) return null;

            const paginasImprimir = calcularPaginasImprimir(arquivo.paginas, config.paginasEspecificas);

            return (
              <View key={index} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 }}>
                {/* Cabeçalho do Arquivo */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons 
                    name={arquivo.tipo === 'pdf' ? 'document-text' : arquivo.tipo === 'word' || arquivo.tipo === 'powerpoint' ? 'document' : 'image'} 
                    size={32} 
                    color="#10B981" 
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary }} numberOfLines={1}>{arquivo.name}</Text>
                    <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                      {arquivo.paginas} pág total • {paginasImprimir} pág a imprimir
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => abrirPreview(arquivo)} style={{ marginRight: 12 }}>
                    <Ionicons name="eye" size={24} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removerArquivo(arquivo.uri)}>
                    <Ionicons name="trash" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Configurações para Documentos */}
                {tipoSelecionado === 'documentos' && (
                  <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Configurações:</Text>
                    
                    {/* Cor */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, colorido: false } })}
                        style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: !config.colorido ? '#10B981' : '#E5E7EB', marginRight: 8 }}
                      >
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: !config.colorido ? '#fff' : Colors.text.secondary }}>
                          P&B
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, colorido: true } })}
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
                          onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, papel: tipo } })}
                          style={{ flex: 1, padding: 8, borderRadius: 8, backgroundColor: config.papel === tipo ? '#10B981' : '#E5E7EB', marginRight: 4 }}
                        >
                          <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: config.papel === tipo ? '#fff' : Colors.text.secondary }}>
                            {tipo === 'comum' ? 'Comum' : tipo === 'cartao' ? 'Cartão' : 'Fotográfico'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Páginas Específicas */}
                    {arquivo.paginas > 1 && (
                      <>
                        <Text style={{ fontSize: 14, marginBottom: 4 }}>Páginas (ex: 1-3, 5, 7-10):</Text>
                        <TextInput
                          value={config.paginasEspecificas}
                          onChangeText={(text) => setConfigs({ ...configs, [arquivo.uri]: { ...config, paginasEspecificas: text } })}
                          placeholder="Todas as páginas"
                          style={{ backgroundColor: Colors.background.secondary, padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                        />
                      </>
                    )}

                    {/* Cópias */}
                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Cópias:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, copias: Math.max(1, config.copias - 1) } })}
                        style={{ padding: 10, backgroundColor: '#E5E7EB', borderRadius: 8 }}
                      >
                        <Ionicons name="remove" size={20} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 }}>{config.copias}</Text>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, copias: config.copias + 1 } })}
                        style={{ padding: 10, backgroundColor: '#10B981', borderRadius: 8 }}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Configurações para Fotos */}
                {tipoSelecionado === 'fotos' && (
                  <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Tamanho:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                      {(['10x15', '13x18', '15x21', '21x29'] as TamanhoFoto[]).map(tamanho => (
                        <TouchableOpacity
                          key={tamanho}
                          onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, tamanhoFoto: tamanho } })}
                          style={{ padding: 10, borderRadius: 8, backgroundColor: config.tamanhoFoto === tamanho ? '#10B981' : '#E5E7EB', marginRight: 8, marginBottom: 8 }}
                        >
                          <Text style={{ fontWeight: 'bold', color: config.tamanhoFoto === tamanho ? '#fff' : Colors.text.secondary }}>
                            {tamanho}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={{ fontSize: 14, marginBottom: 4 }}>Cópias:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, copias: Math.max(1, config.copias - 1) } })}
                        style={{ padding: 10, backgroundColor: '#E5E7EB', borderRadius: 8 }}
                      >
                        <Ionicons name="remove" size={20} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 }}>{config.copias}</Text>
                      <TouchableOpacity
                        onPress={() => setConfigs({ ...configs, [arquivo.uri]: { ...config, copias: config.copias + 1 } })}
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
                {arquivos.reduce((sum, a) => sum + calcularPaginasImprimir(a.paginas, configs[a.uri]?.paginasEspecificas || ''), 0)}
              </Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Valor Total:</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>
                  R$ {calcularPreco().toFixed(2).replace('.', ',')}
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
