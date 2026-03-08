import { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { getDocxTextPreview, getPdfTextPreview, getPptxTextPreview } from '../lib/openXmlUtils';

interface PreviewDocumentoProps {
  visible: boolean;
  onClose: () => void;
  arquivo: {
    uri: string;
    name: string;
    tipo: 'pdf' | 'word' | 'powerpoint' | 'imagem';
    mimeType: string;
  };
}

export function PreviewDocumento({ visible, onClose, arquivo }: PreviewDocumentoProps) {
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      if (!visible) {
        return;
      }

      if (arquivo.tipo !== 'word' && arquivo.tipo !== 'powerpoint') {
        setPreviewText('');
        return;
      }

      setLoadingPreview(true);

      try {
        const extracted =
          arquivo.tipo === 'word'
            ? await getDocxTextPreview(arquivo.uri)
            : await getPptxTextPreview(arquivo.uri);

        if (!active) {
          return;
        }

        setPreviewText(
          extracted ||
            'Nao foi possivel montar a previa detalhada deste documento neste dispositivo, mas o arquivo esta pronto para impressao.'
        );
      } catch (error) {
        if (!active) {
          return;
        }
        setPreviewText('Nao foi possivel montar a previa detalhada deste documento neste dispositivo.');
      } finally {
        if (active) {
          setLoadingPreview(false);
        }
      }
    }

    loadPreview();

    return () => {
      active = false;
    };
  }, [visible, arquivo.tipo, arquivo.uri]);

  async function abrirArquivoExterno() {
    setLoading(true);

    try {
      const urisToTry: string[] = [];
      const originalUri = arquivo.uri;

      urisToTry.push(originalUri);

      const encodedUri = encodeURI(originalUri);
      if (encodedUri !== originalUri) {
        urisToTry.push(encodedUri);
      }

      // No Android, alguns dispositivos só abrem com content://.
      if (Platform.OS === 'android' && originalUri.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(originalUri);
        if (!fileInfo.exists) {
          Alert.alert('Arquivo não encontrado', 'Não foi possível localizar este arquivo para pré-visualização.');
          return;
        }

        const contentUri = await FileSystem.getContentUriAsync(originalUri);
        urisToTry.unshift(contentUri);

        const encodedContentUri = encodeURI(contentUri);
        if (encodedContentUri !== contentUri) {
          urisToTry.unshift(encodedContentUri);
        }
      }

      let opened = false;

      for (const uri of urisToTry) {
        try {
          await Linking.openURL(uri);
          opened = true;
          break;
        } catch (openError) {
          console.warn('⚠️ [PREVIEW] Tentativa de abertura falhou:', uri, openError);
        }
      }

      if (!opened) {
        Alert.alert(
          'Preview indisponível',
          'Não foi possível abrir este arquivo em aplicativo externo neste dispositivo. Verifique se há um app compatível instalado.'
        );
      }
    } catch (error) {
      console.error('❌ [PREVIEW] Falha ao abrir arquivo externo:', error);
      Alert.alert('Erro', 'Não foi possível abrir o arquivo externo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
        {/* Header */}
        <View style={{ 
          backgroundColor: '#10B981', 
          padding: 20, 
          paddingTop: 40,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
              👁️ Preview
            </Text>
            <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9 }} numberOfLines={1}>
              {arquivo.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {arquivo.tipo === 'imagem' ? (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={{ uri: arquivo.uri }}
                style={{
                  width: '100%',
                  height: 500,
                  borderRadius: 12,
                  backgroundColor: '#fff',
                }}
                resizeMode="contain"
              />
              <Text style={{ 
                fontSize: 14, 
                color: Colors.text.secondary, 
                marginTop: 16,
                textAlign: 'center'
              }}>
                Imagem será impressa conforme configurações selecionadas
              </Text>
            </View>
          ) : (
            <View style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 16,
              alignItems: 'center',
            }}>
              <Ionicons 
                name={arquivo.tipo === 'pdf' ? 'document-text' : arquivo.tipo === 'word' ? 'document' : 'easel'} 
                size={72} 
                color={arquivo.tipo === 'pdf' ? '#EF4444' : arquivo.tipo === 'word' ? '#3B82F6' : '#F59E0B'}
                style={{ marginBottom: 12 }}
              />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: Colors.text.primary,
                marginBottom: 8,
                textAlign: 'center'
              }}>
                {arquivo.name}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: Colors.text.secondary,
                textAlign: 'center',
                marginBottom: 24
              }}>
                Tipo: {arquivo.tipo.toUpperCase()}
              </Text>
              
              {arquivo.tipo === 'pdf' ? (
                <View style={{ backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444', width: '100%', marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: '#991B1B', fontWeight: 'bold', marginBottom: 4 }}>📄 Documento PDF</Text>
                  <Text style={{ fontSize: 13, color: '#7F1D1D' }}>Arquivo carregado e pronto para impressão.{'\n'}Use "Abrir em outro app" para visualizar o conteúdo completo.</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3B82F6', width: '100%', marginBottom: 16 }}>
                  {loadingPreview ? (
                    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                      <ActivityIndicator size="large" color="#3B82F6" />
                      <Text style={{ fontSize: 13, color: '#1E40AF', marginTop: 8 }}>Carregando prévia...</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 13, color: '#1E40AF', lineHeight: 20 }}>
                      <Text style={{ fontWeight: 'bold' }}>👁️ Prévia do conteúdo:{'\n'}</Text>
                      {previewText || 'Arquivo carregado e pronto para impressão.'}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={abrirArquivoExterno}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#BFDBFE' : '#DBEAFE',
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <Ionicons name="open-outline" size={20} color="#1E40AF" />
                <Text style={{ color: '#1E40AF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                  {loading ? 'Abrindo...' : 'Abrir em outro app (opcional)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Botão Fechar */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#10B981',
              padding: 18,
              borderRadius: 16,
              elevation: 4,
            }}
          >
            <Text style={{ 
              color: '#fff', 
              fontSize: 18, 
              fontWeight: 'bold', 
              textAlign: 'center' 
            }}>
              Fechar Preview
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
