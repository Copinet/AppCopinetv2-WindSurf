import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import * as FileSystem from 'expo-file-system';

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
                width: '100%'
              }}>
                <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 22 }}>
                  <Text style={{ fontWeight: 'bold' }}>ℹ️ Preview completo:</Text>
                  {'\n\n'}
                  O preview completo de documentos PDF, Word e PowerPoint estará disponível em breve.
                  {'\n\n'}
                  Por enquanto, você pode:
                  {'\n'}• Verificar o nome do arquivo
                  {'\n'}• Confirmar o número de páginas
                  {'\n'}• Ajustar as configurações de impressão
                  {'\n\n'}
                  O documento será enviado corretamente para impressão.
                </Text>
              </View>
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
