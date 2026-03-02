import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import * as DocumentPicker from 'expo-document-picker';

interface ArquivoUpload {
  uri: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onFilesSelected: (files: ArquivoUpload[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  label?: string;
}

export function FileUpload({ 
  onFilesSelected, 
  maxFiles = 10, 
  acceptedTypes = ['application/pdf', 'image/*'],
  label = 'Adicionar Arquivos'
}: FileUploadProps) {
  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);

  async function selecionarArquivos() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const novosArquivos: ArquivoUpload[] = result.assets?.map((asset: any) => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          type: asset.mimeType,
        })) || [];

        if (arquivos.length + novosArquivos.length > maxFiles) {
          Alert.alert('Limite excedido', `Você pode adicionar no máximo ${maxFiles} arquivos`);
          return;
        }

        const todosArquivos = [...arquivos, ...novosArquivos];
        setArquivos(todosArquivos);
        onFilesSelected(todosArquivos);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivos:', error);
      Alert.alert('Erro', 'Não foi possível selecionar os arquivos');
    }
  }

  function removerArquivo(uri: string) {
    const novosArquivos = arquivos.filter(a => a.uri !== uri);
    setArquivos(novosArquivos);
    onFilesSelected(novosArquivos);
  }

  function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <View>
      {/* Botão Upload */}
      <TouchableOpacity
        onPress={selecionarArquivos}
        style={{
          backgroundColor: '#10B981',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          elevation: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="cloud-upload" size={24} color="#fff" style={{ marginRight: 12 }} />
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          {label}
        </Text>
      </TouchableOpacity>

      {/* Lista de Arquivos */}
      {arquivos.length > 0 && (
        <View style={{
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 12,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            📎 Arquivos Selecionados ({arquivos.length}/{maxFiles})
          </Text>

          {arquivos.map((arquivo, index) => (
            <View 
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < arquivos.length - 1 ? 1 : 0,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <Ionicons 
                name={arquivo.type.includes('pdf') ? 'document-text' : 'image'} 
                size={28} 
                color="#10B981" 
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text 
                  style={{ fontSize: 14, fontWeight: '600', color: Colors.text.primary }} 
                  numberOfLines={1}
                >
                  {arquivo.name}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 2 }}>
                  {formatarTamanho(arquivo.size)}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => removerArquivo(arquivo.uri)}
                style={{ padding: 8 }}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Info */}
      {arquivos.length === 0 && (
        <View style={{
          backgroundColor: '#F3F4F6',
          padding: 12,
          borderRadius: 8,
          marginTop: 8,
        }}>
          <Text style={{ fontSize: 13, color: Colors.text.secondary, textAlign: 'center' }}>
            Nenhum arquivo selecionado
          </Text>
        </View>
      )}
    </View>
  );
}
