import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

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

  async function abrirArquivoExterno() {
    try {
      const canOpen = await Linking.canOpenURL(arquivo.uri);

      if (!canOpen) {
        Alert.alert('Preview indisponível', 'Não foi possível abrir este arquivo em aplicativo externo neste dispositivo.');
        return;
      }

      await Linking.openURL(arquivo.uri);
    } catch (error) {
      console.error('❌ [PREVIEW] Falha ao abrir arquivo externo:', error);
      Alert.alert('Erro', 'Não foi possível abrir o arquivo externo.');
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
                name={
                  arquivo.tipo === 'pdf' ? 'document-text' :
                  arquivo.tipo === 'word' ? 'document' : 
                  'easel'
                } 
                size={80} 
                color="#10B981" 
                style={{ marginBottom: 16 }}
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
              
              <View style={{
                backgroundColor: '#EFF6FF',
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#3B82F6',
                width: '100%',
                marginBottom: 16
              }}>
                <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 22 }}>
                  <Text style={{ fontWeight: 'bold' }}>👁️ Preview:</Text>
                  {'\n\n'}
                  O arquivo foi carregado com sucesso e será enviado para impressão com as configurações selecionadas.
                  {'\n\n'}
                  • Verifique o nome do arquivo acima
                  {'\n'}• Confirme as configurações de impressão
                  {'\n'}• O documento será processado corretamente
                </Text>
              </View>

              <TouchableOpacity
                onPress={abrirArquivoExterno}
                style={{
                  backgroundColor: '#3B82F6',
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <Ionicons name="open-outline" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                  Abrir em Aplicativo Externo
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
