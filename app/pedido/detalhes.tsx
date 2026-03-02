import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Pedido, PedidoHistorico, StatusPedido } from '../../types';

export default function PedidoDetalhes() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [historico, setHistorico] = useState<PedidoHistorico[]>([]);

  useEffect(() => {
    loadPedido();
    
    // Realtime para atualizações
    const subscription = supabase
      .channel(`pedido_detalhes_${id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${id}` },
        (payload) => {
          setPedido(payload.new as Pedido);
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos_historico', filter: `pedido_id=eq.${id}` },
        () => {
          loadHistorico();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  async function loadPedido() {
    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .single();

      if (pedidoError) throw pedidoError;
      setPedido(pedidoData);

      await loadHistorico();
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistorico() {
    try {
      const { data, error } = await supabase
        .from('pedidos_historico')
        .select('*')
        .eq('pedido_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  async function abrirSuporte() {
    const whatsapp = '+5513988813785';
    const mensagem = pedido 
      ? `Olá! Preciso de ajuda com o pedido #${pedido.numero_pedido}`
      : 'Olá! Preciso de ajuda';
    
    const url = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      alert('Não foi possível abrir o WhatsApp');
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary }}>
        <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Carregando detalhes...
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
          onPress={() => router.back()}
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
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(pedido.status);
  const dataPedido = new Date(pedido.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: statusInfo.color,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 30,
        elevation: 8,
        shadowColor: Colors.shadow.metallic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '600' }}>
            Voltar
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name={statusInfo.icon as any} size={40} color="#fff" />
          </View>

          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>
            #{pedido.numero_pedido}
          </Text>
          <Text style={{ fontSize: 18, color: '#fff', opacity: 0.9 }}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        {/* Status Atual */}
        <View style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 4,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
            📊 Status Atual
          </Text>

          <View style={{
            backgroundColor: `${statusInfo.color}20`,
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: statusInfo.color,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: statusInfo.color, flex: 1 }}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              {statusInfo.descricao}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        {historico.length > 0 && (
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
              📅 Histórico
            </Text>

            {historico.map((item, index) => {
              const itemStatusInfo = getStatusInfo(item.status_novo as StatusPedido);
              const dataItem = new Date(item.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <View key={item.id} style={{ flexDirection: 'row', marginBottom: index < historico.length - 1 ? 16 : 0 }}>
                  <View style={{ alignItems: 'center', marginRight: 12 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${itemStatusInfo.color}20`,
                      borderWidth: 2,
                      borderColor: itemStatusInfo.color,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Ionicons name={itemStatusInfo.icon as any} size={20} color={itemStatusInfo.color} />
                    </View>
                    {index < historico.length - 1 && (
                      <View style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: Colors.background.secondary,
                        marginVertical: 4,
                      }} />
                    )}
                  </View>

                  <View style={{ flex: 1, paddingBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 4 }}>
                      {itemStatusInfo.label}
                    </Text>
                    {item.observacao && (
                      <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
                        {item.observacao}
                      </Text>
                    )}
                    <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
                      {dataItem}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Informações do Pedido */}
        <View style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
            ℹ️ Informações
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
              Data do Pedido
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
              {dataPedido}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
              Tipo de Serviço
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
              {pedido.tipo_servico === 'fazemos_pra_voce' ? '🤝 Fazemos pra Você' : '✍️ Faça Você Mesmo'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
              Pagamento
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name={pedido.status_pagamento === 'aprovado' ? 'checkmark-circle' : 'time'} 
                size={20} 
                color={pedido.status_pagamento === 'aprovado' ? '#10B981' : '#F59E0B'} 
                style={{ marginRight: 6 }}
              />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: pedido.status_pagamento === 'aprovado' ? '#10B981' : '#F59E0B' 
              }}>
                {pedido.status_pagamento === 'aprovado' ? 'Confirmado' : 'Pendente'}
              </Text>
            </View>
          </View>

          {pedido.observacoes && (
            <View>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
                Observações
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                {pedido.observacoes}
              </Text>
            </View>
          )}
        </View>

        {/* Valor */}
        <View style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
            💰 Valores
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
                Total
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.secondary.DEFAULT }}>
                R$ {pedido.valor_final.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>
        </View>

        {/* Botão de Suporte */}
        <TouchableOpacity
          onPress={abrirSuporte}
          style={{
            backgroundColor: '#10B981',
            paddingVertical: 16,
            borderRadius: 16,
            marginBottom: 12,
            elevation: 4,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="logo-whatsapp" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>
            Falar com Suporte
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/orders')}
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 16,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: Colors.text.secondary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Ver Todos os Pedidos
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function getStatusInfo(status: StatusPedido): { label: string; color: string; icon: string; descricao: string } {
  const statusMap: Record<StatusPedido, { label: string; color: string; icon: string; descricao: string }> = {
    aguardando_pagamento: { 
      label: 'Aguardando Pagamento', 
      color: '#F59E0B', 
      icon: 'time',
      descricao: 'Estamos aguardando a confirmação do seu pagamento'
    },
    pagamento_confirmado: { 
      label: 'Pagamento Confirmado', 
      color: '#10B981', 
      icon: 'checkmark-circle',
      descricao: 'Pagamento aprovado! Seu pedido será processado em breve'
    },
    em_processamento: { 
      label: 'Em Processamento', 
      color: '#3B82F6', 
      icon: 'sync',
      descricao: 'Estamos processando seu pedido agora'
    },
    aguardando_parceiro: { 
      label: 'Buscando Parceiro', 
      color: '#8B5CF6', 
      icon: 'search',
      descricao: 'Procurando o melhor parceiro para atender você'
    },
    em_andamento: { 
      label: 'Em Andamento', 
      color: '#06B6D4', 
      icon: 'rocket',
      descricao: 'Seu serviço está sendo executado'
    },
    aguardando_retirada: { 
      label: 'Pronto para Retirada', 
      color: '#10B981', 
      icon: 'bag-check',
      descricao: 'Seu pedido está pronto! Você pode retirá-lo'
    },
    concluido: { 
      label: 'Concluído', 
      color: '#10B981', 
      icon: 'checkmark-done',
      descricao: 'Pedido finalizado com sucesso!'
    },
    cancelado: { 
      label: 'Cancelado', 
      color: '#EF4444', 
      icon: 'close-circle',
      descricao: 'Este pedido foi cancelado'
    },
  };

  return statusMap[status] || { 
    label: status, 
    color: Colors.text.secondary, 
    icon: 'help-circle',
    descricao: 'Status desconhecido'
  };
}
