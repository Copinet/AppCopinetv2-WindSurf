import { View, Text, TouchableOpacity, Share, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/Colors';

interface QRCodeRetiradaProps {
  numeroPedido: string;
  parceiroNome: string;
  parceiroEndereco: string;
  horarioEstimado: string;
  filaAtual: number;
  parceiroLatitude?: number;
  parceiroLongitude?: number;
}

export function QRCodeRetirada({
  numeroPedido,
  parceiroNome,
  parceiroEndereco,
  horarioEstimado,
  filaAtual,
  parceiroLatitude,
  parceiroLongitude,
}: QRCodeRetiradaProps) {
  
  const qrData = JSON.stringify({
    pedido: numeroPedido,
    parceiro: parceiroNome,
    timestamp: new Date().toISOString(),
  });

  async function compartilharQRCode() {
    try {
      await Share.share({
        message: `Pedido #${numeroPedido}\n\nRetirar em: ${parceiroNome}\n${parceiroEndereco}\n\nHorário estimado: ${horarioEstimado}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }

  async function abrirNoMapa() {
    try {
      if (parceiroLatitude && parceiroLongitude) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${parceiroLatitude},${parceiroLongitude}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'Não foi possível abrir o mapa');
        }
      } else {
        Alert.alert('Erro', 'Localização do parceiro não disponível');
      }
    } catch (error) {
      console.error('Erro ao abrir mapa:', error);
      Alert.alert('Erro', 'Não foi possível abrir o mapa');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header de Sucesso */}
      <View style={{
        backgroundColor: '#10B981',
        padding: 24,
        paddingTop: 40,
        alignItems: 'center',
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Ionicons name="checkmark-circle" size={60} color="#10B981" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          Impressão Aceita!
        </Text>
        <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
          Seu documento está sendo preparado
        </Text>
      </View>

      {/* QR Code */}
      <View style={{
        backgroundColor: '#fff',
        margin: 20,
        padding: 24,
        borderRadius: 16,
        elevation: 8,
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
          QR Code para Retirada
        </Text>

        <View style={{
          padding: 20,
          backgroundColor: '#fff',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#E5E7EB',
        }}>
          <QRCode
            value={qrData}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>

        <Text style={{
          fontSize: 13,
          color: Colors.text.secondary,
          textAlign: 'center',
          marginTop: 16,
        }}>
          Apresente este QR Code ao parceiro na hora da retirada
        </Text>
      </View>

      {/* Informações do Parceiro */}
      <View style={{
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        elevation: 4,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
          📍 Local de Retirada
        </Text>

        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="storefront" size={20} color="#10B981" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginLeft: 12 }}>
              {parceiroNome}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
            <Ionicons name="location" size={20} color="#6B7280" style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginLeft: 12, flex: 1 }}>
              {parceiroEndereco}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="time" size={20} color="#3B82F6" />
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginLeft: 12 }}>
              Pronto às: {horarioEstimado}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people" size={20} color="#F59E0B" />
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginLeft: 12 }}>
              {filaAtual > 0 ? `${filaAtual} pedido(s) na fila` : 'Sem fila de espera'}
            </Text>
          </View>
        </View>

        {/* Botão Abrir Mapa */}
        <TouchableOpacity
          onPress={abrirNoMapa}
          style={{
            backgroundColor: '#3B82F6',
            padding: 14,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
            Abrir no Mapa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Número do Pedido */}
      <View style={{
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        elevation: 4,
      }}>
        <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
          Número do Pedido:
        </Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', marginBottom: 16 }}>
          #{numeroPedido}
        </Text>

        <TouchableOpacity
          onPress={compartilharQRCode}
          style={{
            backgroundColor: '#10B981',
            padding: 14,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
            Compartilhar Informações
          </Text>
        </TouchableOpacity>
      </View>

      {/* Aviso Importante */}
      <View style={{
        backgroundColor: '#EFF6FF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>Importante:</Text>
              {'\n\n'}
              • Leve um documento com foto para retirada
              {'\n'}
              • O QR Code é válido apenas para este pedido
              {'\n'}
              • Você será notificado quando estiver pronto
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
