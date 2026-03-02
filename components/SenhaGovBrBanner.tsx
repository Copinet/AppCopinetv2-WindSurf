import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useState } from 'react';

interface SenhaGovBrBannerProps {
  style?: any;
}

export function SenhaGovBrBanner({ style }: SenhaGovBrBannerProps) {
  const [mostrarTutorial, setMostrarTutorial] = useState(false);

  return (
    <View style={style}>
      {/* Banner Principal */}
      <View style={{
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        elevation: 2,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons name="warning" size={24} color="#F59E0B" style={{ marginRight: 12, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B', marginBottom: 6 }}>
              ⚠️ Necessário Senha Gov.br
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
              • Nível <Text style={{ fontWeight: 'bold' }}>Prata ou Ouro</Text> recomendado
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              • Verificação em 2 etapas deve estar <Text style={{ fontWeight: 'bold' }}>DESATIVADA</Text>
            </Text>
            
            <TouchableOpacity
              onPress={() => setMostrarTutorial(!mostrarTutorial)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 14, color: '#F59E0B', fontWeight: '600', marginRight: 4 }}>
                {mostrarTutorial ? 'Ocultar tutorial' : 'Como desativar verificação em 2 etapas?'}
              </Text>
              <Ionicons 
                name={mostrarTutorial ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#F59E0B" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tutorial Expansível */}
      {mostrarTutorial && (
        <View style={{
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 12,
          marginTop: 12,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#F59E0B',
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
            📱 Tutorial - Desativar Verificação em 2 Etapas
          </Text>
          
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#F59E0B',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>1</Text>
              </View>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, flex: 1 }}>
                Entre no app <Text style={{ fontWeight: 'bold' }}>Gov.br</Text> no seu celular
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#F59E0B',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>2</Text>
              </View>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, flex: 1 }}>
                Faça login com seu CPF e senha
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#F59E0B',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>3</Text>
              </View>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, flex: 1 }}>
                Vá em <Text style={{ fontWeight: 'bold' }}>"Segurança e Privacidade"</Text>
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#F59E0B',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>4</Text>
              </View>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, flex: 1 }}>
                Clique em <Text style={{ fontWeight: 'bold' }}>"Desativar verificação em 2 etapas"</Text>
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: '#DCFCE7',
            padding: 12,
            borderRadius: 8,
            marginTop: 8,
          }}>
            <Text style={{ fontSize: 13, color: '#059669', fontWeight: '600' }}>
              ✅ Após o serviço ser concluído, você pode reativar a verificação em 2 etapas para maior segurança!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
