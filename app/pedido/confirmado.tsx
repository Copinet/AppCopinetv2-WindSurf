import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Pedido } from '../../types';

export default function PedidoConfirmado() {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    loadPedido();
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
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary }}>
        <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Carregando...
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header de Sucesso */}
      <View style={{ 
        backgroundColor: '#10B981',
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.shadow.metallic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }}>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Ionicons name="checkmark-circle" size={70} color="#fff" />
        </View>

        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' }}>
          Pedido Confirmado! 🎉
        </Text>
        <Text style={{ fontSize: 18, color: '#fff', opacity: 0.9, textAlign: 'center' }}>
          Pagamento aprovado com sucesso
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* Número do Pedido */}
        <View style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 4,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, color: Colors.text.secondary, marginBottom: 8 }}>
            Número do Pedido
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.secondary.DEFAULT, marginBottom: 16 }}>
            #{pedido.numero_pedido}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.secondary, textAlign: 'center' }}>
            Guarde este número para acompanhar seu pedido
          </Text>
        </View>

        {/* Próximos Passos */}
        <View style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
            📋 Próximos Passos
          </Text>

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 }}>
                  Processamento
                </Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                  Estamos processando seu pedido agora mesmo
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: Colors.text.secondary, fontSize: 16, fontWeight: 'bold' }}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 }}>
                  Execução
                </Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                  Seu serviço será executado em breve
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: Colors.text.secondary, fontSize: 16, fontWeight: 'bold' }}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 }}>
                  Conclusão
                </Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                  Você receberá uma notificação quando estiver pronto
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informações Importantes */}
        <View style={{
          backgroundColor: '#EFF6FF',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#3B82F6',
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginBottom: 8 }}>
                Importante
              </Text>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 6 }}>
                • Você pode acompanhar o status do pedido na aba "Pedidos"
              </Text>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 6 }}>
                • Enviaremos notificações sobre cada etapa
              </Text>
              <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                • Em caso de dúvidas, use o suporte no app
              </Text>
            </View>
          </View>
        </View>

        {/* Valor Pago */}
        <View style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
            💳 Resumo do Pagamento
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 15, color: Colors.text.secondary }}>Valor do Serviço</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary }}>
              R$ {pedido.valor_total.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          {pedido.valor_desconto > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 15, color: '#10B981' }}>Desconto</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#10B981' }}>
                - R$ {pedido.valor_desconto.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          )}

          <View style={{ 
            borderTopWidth: 1, 
            borderTopColor: Colors.background.secondary,
            paddingTop: 12,
            marginTop: 8,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary }}>
                Total Pago
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.secondary.DEFAULT }}>
                R$ {pedido.valor_final.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de Ação */}
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/pedido/detalhes',
            params: { id: pedido.id }
          })}
          style={{
            backgroundColor: Colors.secondary.DEFAULT,
            paddingVertical: 16,
            borderRadius: 16,
            marginBottom: 12,
            elevation: 4,
            shadowColor: Colors.shadow.metallic,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>
            Ver Detalhes do Pedido
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/orders')}
          style={{
            backgroundColor: '#fff',
            paddingVertical: 16,
            borderRadius: 16,
            marginBottom: 12,
            elevation: 2,
            borderWidth: 2,
            borderColor: Colors.secondary.DEFAULT,
          }}
        >
          <Text style={{ color: Colors.secondary.DEFAULT, fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>
            Ver Todos os Pedidos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/home')}
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 16,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: Colors.text.secondary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Voltar para Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
