import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Pedido } from '../../types';

export default function PagamentoPedido() {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);
  const [pixGerado, setPixGerado] = useState(false);

  useEffect(() => {
    loadPedido();
    
    // Realtime para verificar pagamento
    const subscription = supabase
      .channel(`pedido_${pedidoId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedidoId}` },
        (payload) => {
          const pedidoAtualizado = payload.new as Pedido;
          setPedido(pedidoAtualizado);
          
          if (pedidoAtualizado.status_pagamento === 'aprovado') {
            // Pagamento confirmado!
            router.replace({
              pathname: '/pedido/confirmado',
              params: { pedidoId: pedidoAtualizado.id }
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [pedidoId]);

  async function loadPedido() {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (error) throw error;
      setPedido(data);

      // Se já tem pagamento aprovado, redirecionar
      if (data.status_pagamento === 'aprovado') {
        router.replace({
          pathname: '/pedido/confirmado',
          params: { pedidoId: data.id }
        });
        return;
      }

      // Gerar PIX se ainda não foi gerado
      if (!data.pix_qrcode) {
        await gerarPix(data);
      } else {
        setPixGerado(true);
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  }

  async function gerarPix(pedidoData: Pedido) {
    try {
      // TODO: Integrar com Mercado Pago para gerar QR Code real
      // Por enquanto, vou simular a geração do PIX
      
      const pixCodigo = `00020126580014br.gov.bcb.pix0136${pedidoData.id}520400005303986540${pedidoData.valor_final.toFixed(2)}5802BR5925COPINET SERVICOS DIGITAIS6009SAO PAULO62070503***6304`;
      const pixExpiracao = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

      const { error } = await supabase
        .from('pedidos')
        .update({
          pix_codigo: pixCodigo,
          pix_qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCodigo)}`,
          pix_expiracao: pixExpiracao,
        })
        .eq('id', pedidoData.id);

      if (error) throw error;

      setPedido({
        ...pedidoData,
        pix_codigo: pixCodigo,
        pix_qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCodigo)}`,
        pix_expiracao: pixExpiracao,
      });

      setPixGerado(true);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      alert('Erro ao gerar código PIX. Tente novamente.');
    }
  }

  async function copiarCodigoPix() {
    if (pedido?.pix_codigo) {
      Clipboard.setString(pedido.pix_codigo);
      alert('Código PIX copiado! Cole no seu app de pagamento.');
    }
  }

  async function simularPagamento() {
    if (!pedido) return;
    
    setVerificandoPagamento(true);

    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data, error } = await supabase
        .from('pedidos')
        .update({
          status_pagamento: 'aprovado',
          status: 'pagamento_confirmado',
          data_pagamento: new Date().toISOString(),
        })
        .eq('id', pedido.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      if (data) {
        setPedido(data);
      }

      // Aguardar um pouco e redirecionar manualmente caso realtime falhe
      setTimeout(() => {
        router.replace({
          pathname: '/pedido/confirmado',
          params: { pedidoId: pedido.id }
        });
      }, 500);

    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
      setVerificandoPagamento(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary }}>
        <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Preparando pagamento...
        </Text>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary, padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginTop: 16, textAlign: 'center' }}>
          Pedido não encontrado
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/orders')}
          style={{
            backgroundColor: Colors.secondary.DEFAULT,
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
            marginTop: 20,
            elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Ver Meus Pedidos
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tempoRestante = pedido.pix_expiracao 
    ? Math.max(0, Math.floor((new Date(pedido.pix_expiracao).getTime() - Date.now()) / 60000))
    : 30;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#10B981',
        padding: 24,
        paddingTop: 40,
        paddingBottom: 30,
        elevation: 8,
        shadowColor: Colors.shadow.metallic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="card-outline" size={40} color="#fff" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6, textAlign: 'center' }}>
            Pagamento PIX 💳
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9, textAlign: 'center' }}>
            Pedido #{pedido.numero_pedido}
          </Text>
        </View>
      </View>

      <View style={{ padding: 20 }}>
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
            Valor a Pagar
          </Text>
          <Text style={{ fontSize: 42, fontWeight: 'bold', color: Colors.secondary.DEFAULT }}>
            R$ {pedido.valor_final.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        {/* Tempo Restante */}
        {pixGerado && tempoRestante > 0 && (
          <View style={{
            backgroundColor: '#FFFBEB',
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={24} color="#F59E0B" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
                  ⏰ Tempo Restante
                </Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                  Este código expira em {tempoRestante} minutos
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* QR Code */}
        {pixGerado && pedido.pix_qrcode && (
          <View style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 16,
            marginBottom: 20,
            elevation: 4,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
              📱 Escaneie o QR Code
            </Text>
            
            <View style={{
              width: 300,
              height: 300,
              backgroundColor: Colors.background.secondary,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              {/* Placeholder para QR Code - em produção usar Image */}
              <Ionicons name="qr-code" size={200} color={Colors.text.secondary} />
            </View>

            <Text style={{ fontSize: 14, color: Colors.text.secondary, textAlign: 'center' }}>
              Abra o app do seu banco e escaneie o código acima
            </Text>
          </View>
        )}

        {/* Código PIX Copia e Cola */}
        {pixGerado && pedido.pix_codigo && (
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            elevation: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
              📋 Ou use o Pix Copia e Cola
            </Text>
            
            <View style={{
              backgroundColor: Colors.background.secondary,
              padding: 14,
              borderRadius: 12,
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 12, color: Colors.text.secondary, fontFamily: 'monospace' }} numberOfLines={3}>
                {pedido.pix_codigo}
              </Text>
            </View>

            <TouchableOpacity
              onPress={copiarCodigoPix}
              style={{
                backgroundColor: '#10B981',
                paddingVertical: 14,
                borderRadius: 12,
                elevation: 4,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                Copiar Código PIX
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instruções */}
        <View style={{
          backgroundColor: '#EFF6FF',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3B82F6', marginBottom: 12 }}>
            📖 Como Pagar
          </Text>
          
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginRight: 8 }}>1.</Text>
              <Text style={{ fontSize: 15, color: Colors.text.secondary, flex: 1 }}>
                Abra o app do seu banco
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginRight: 8 }}>2.</Text>
              <Text style={{ fontSize: 15, color: Colors.text.secondary, flex: 1 }}>
                Escolha pagar com PIX
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginRight: 8 }}>3.</Text>
              <Text style={{ fontSize: 15, color: Colors.text.secondary, flex: 1 }}>
                Escaneie o QR Code ou cole o código
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginRight: 8 }}>4.</Text>
              <Text style={{ fontSize: 15, color: Colors.text.secondary, flex: 1 }}>
                Confirme o pagamento
              </Text>
            </View>
          </View>
        </View>

        {/* Botão Simular Pagamento (APENAS PARA TESTES) */}
        <View style={{
          backgroundColor: '#FEF3C7',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B', marginBottom: 12, textAlign: 'center' }}>
            🧪 MODO DE TESTE
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 16, textAlign: 'center' }}>
            Clique abaixo para simular a aprovação do pagamento
          </Text>
          <TouchableOpacity
            onPress={simularPagamento}
            disabled={verificandoPagamento}
            style={{
              backgroundColor: verificandoPagamento ? '#9CA3AF' : '#F59E0B',
              paddingVertical: 14,
              borderRadius: 12,
              elevation: 4,
            }}
          >
            {verificandoPagamento ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
                Simular Pagamento Aprovado
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Aguardando Pagamento */}
        <View style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary, marginTop: 12, marginBottom: 4 }}>
            Aguardando Pagamento...
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.secondary, textAlign: 'center' }}>
            Assim que o pagamento for confirmado, você será redirecionado automaticamente
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
