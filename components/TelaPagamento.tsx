import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/Colors';

interface TelaPagamentoProps {
  valorTotal: number;
  numeroPedido: string;
  onPagamentoConcluido: () => void;
}

export function TelaPagamento({ valorTotal, numeroPedido, onPagamentoConcluido }: TelaPagamentoProps) {
  const [codigoPix, setCodigoPix] = useState<string>('');
  const [aguardandoPagamento, setAguardandoPagamento] = useState(true);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos

  useEffect(() => {
    // Gerar código PIX simulado
    const codigo = `00020126580014br.gov.bcb.pix0136${numeroPedido}@copinet.com.br520400005303986540${valorTotal.toFixed(2)}5802BR5913COPINET LTDA6009SAO PAULO62070503***6304`;
    setCodigoPix(codigo);

    // Simular pagamento aprovado após 3 segundos (para teste)
    const timer = setTimeout(() => {
      setAguardandoPagamento(false);
      Alert.alert(
        '✅ Pagamento Aprovado!',
        'Seu pagamento foi confirmado. Gerando QR Code de retirada...',
        [{ text: 'OK', onPress: onPagamentoConcluido }]
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [valorTotal, numeroPedido]);

  useEffect(() => {
    // Contador de tempo
    if (tempoRestante > 0 && aguardandoPagamento) {
      const interval = setInterval(() => {
        setTempoRestante(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tempoRestante, aguardandoPagamento]);

  const copiarCodigoPix = () => {
    Clipboard.setString(codigoPix);
    Alert.alert('✅ Copiado!', 'Código PIX copiado para a área de transferência');
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View style={{ backgroundColor: '#10B981', padding: 24, paddingTop: 40, elevation: 8 }}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="card" size={64} color="#fff" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>
            💳 Pagamento PIX
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
            Escaneie o QR Code ou copie o código
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1, padding: 20 }}>
        {/* Valor */}
        <View style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 4,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, color: Colors.text.secondary, marginBottom: 8 }}>
            Valor Total
          </Text>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#10B981' }}>
            R$ {valorTotal.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.secondary, marginTop: 8 }}>
            Pedido: {numeroPedido}
          </Text>
        </View>

        {/* QR Code PIX */}
        <View style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 4,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
            QR Code PIX
          </Text>
          
          {codigoPix ? (
            <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 12 }}>
              <QRCode
                value={codigoPix}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>
          ) : (
            <ActivityIndicator size="large" color="#10B981" />
          )}

          {/* Botão Copiar Código */}
          <TouchableOpacity
            onPress={copiarCodigoPix}
            style={{
              backgroundColor: '#3B82F6',
              padding: 16,
              borderRadius: 12,
              marginTop: 20,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="copy" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
              Copiar Código PIX
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status do Pagamento */}
        {aguardandoPagamento && (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#92400E', marginLeft: 12 }}>
                Aguardando Pagamento...
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#92400E', marginBottom: 8 }}>
              Abra o app do seu banco e escaneie o QR Code ou cole o código PIX
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#92400E' }}>
              ⏱️ Tempo restante: {formatarTempo(tempoRestante)}
            </Text>
          </View>
        )}

        {/* Instruções */}
        <View style={{
          backgroundColor: '#EFF6FF',
          padding: 20,
          borderRadius: 16,
          borderLeftWidth: 4,
          borderLeftColor: '#3B82F6',
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E40AF', marginBottom: 12 }}>
            📱 Como pagar:
          </Text>
          <Text style={{ fontSize: 14, color: '#1E40AF', marginBottom: 8 }}>
            1. Abra o app do seu banco
          </Text>
          <Text style={{ fontSize: 14, color: '#1E40AF', marginBottom: 8 }}>
            2. Escolha "Pagar com PIX"
          </Text>
          <Text style={{ fontSize: 14, color: '#1E40AF', marginBottom: 8 }}>
            3. Escaneie o QR Code ou cole o código
          </Text>
          <Text style={{ fontSize: 14, color: '#1E40AF' }}>
            4. Confirme o pagamento
          </Text>
        </View>
      </View>
    </View>
  );
}
