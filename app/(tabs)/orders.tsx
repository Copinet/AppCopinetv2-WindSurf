import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Pedido, StatusPedido } from '../../types';

const STATUS_FLOW: StatusPedido[] = [
  'aguardando_pagamento',
  'pagamento_confirmado',
  'aguardando_parceiro',
  'em_processamento',
  'em_andamento',
  'aguardando_retirada',
  'concluido',
];

function getStatusInfo(status: StatusPedido): { label: string; color: string; icon: string } {
  const statusMap: Record<StatusPedido, { label: string; color: string; icon: string }> = {
    aguardando_pagamento: { label: 'Aguardando Pagamento', color: '#F59E0B', icon: 'time' },
    pagamento_confirmado: { label: 'Pagamento Confirmado', color: '#10B981', icon: 'checkmark-circle' },
    em_processamento: { label: 'Em Processamento', color: '#3B82F6', icon: 'sync' },
    aguardando_parceiro: { label: 'Buscando Parceiro', color: '#8B5CF6', icon: 'search' },
    em_andamento: { label: 'Em Andamento', color: '#06B6D4', icon: 'rocket' },
    aguardando_retirada: { label: 'Pronto para Retirada', color: '#10B981', icon: 'bag-check' },
    concluido: { label: 'Concluído', color: '#10B981', icon: 'checkmark-done' },
    cancelado: { label: 'Cancelado', color: '#EF4444', icon: 'close-circle' },
  };

  return statusMap[status] || { label: status, color: Colors.text.secondary, icon: 'help-circle' };
}

function getProgressInfo(pedido: Pedido): { percent: number; etapaAtual: string } {
  if (pedido.status === 'cancelado') {
    return { percent: 100, etapaAtual: 'Pedido cancelado' };
  }

  const currentIndex = STATUS_FLOW.indexOf(pedido.status);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const totalEtapas = STATUS_FLOW.length - 1;
  const percent = Math.min(100, Math.max(8, Math.round((safeIndex / totalEtapas) * 100)));

  if (pedido.status_pagamento === 'aprovado' && pedido.status === 'aguardando_pagamento') {
    return {
      percent: Math.max(percent, 25),
      etapaAtual: 'Pagamento confirmado, aguardando atualização do pedido',
    };
  }

  return {
    percent,
    etapaAtual: getStatusInfo(pedido.status).label,
  };
}

export default function Orders() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'em_andamento' | 'concluidos'>('todos');

  useEffect(() => {
    loadPedidos();
    
    // Realtime subscription para atualizações
    const subscription = supabase
      .channel('pedidos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pedidos' },
        () => {
          loadPedidos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPedidos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadPedidos();
  }

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'em_andamento') {
      return !['concluido', 'cancelado'].includes(pedido.status);
    }
    if (filtroStatus === 'concluidos') {
      return ['concluido', 'cancelado'].includes(pedido.status);
    }
    return true;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary }}>
        <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Carregando pedidos...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: Colors.background.secondary }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary.DEFAULT]} />
      }
    >
      {/* Header */}
      <View style={{ 
        backgroundColor: Colors.primary.DEFAULT,
        padding: 24,
        paddingTop: 40,
        paddingBottom: 30,
        elevation: 8,
        shadowColor: Colors.shadow.metallic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 6 }}>
          Meus Pedidos 📦
        </Text>
        <Text style={{ fontSize: 16, color: Colors.text.secondary }}>
          Acompanhe seus serviços
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* Filtros */}
        <View style={{ 
          flexDirection: 'row', 
          marginBottom: 24,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 6,
          elevation: 4,
          shadowColor: Colors.shadow.medium,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}>
          <TouchableOpacity
            onPress={() => setFiltroStatus('todos')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              backgroundColor: filtroStatus === 'todos' ? Colors.secondary.DEFAULT : 'transparent',
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold', 
              color: filtroStatus === 'todos' ? '#fff' : Colors.text.secondary,
              textAlign: 'center',
            }}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFiltroStatus('em_andamento')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              backgroundColor: filtroStatus === 'em_andamento' ? Colors.secondary.DEFAULT : 'transparent',
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold', 
              color: filtroStatus === 'em_andamento' ? '#fff' : Colors.text.secondary,
              textAlign: 'center',
            }}>
              Em Andamento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFiltroStatus('concluidos')}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              backgroundColor: filtroStatus === 'concluidos' ? Colors.secondary.DEFAULT : 'transparent',
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 'bold', 
              color: filtroStatus === 'concluidos' ? '#fff' : Colors.text.secondary,
              textAlign: 'center',
            }}>
              Concluídos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <View style={{ 
            backgroundColor: '#fff',
            padding: 40,
            borderRadius: 16,
            alignItems: 'center',
            elevation: 2,
          }}>
            <Ionicons name="receipt-outline" size={64} color={Colors.text.secondary} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginTop: 16, marginBottom: 8 }}>
              Nenhum pedido encontrado
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, textAlign: 'center', marginBottom: 20 }}>
              Você ainda não fez nenhum pedido
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/services')}
              style={{
                backgroundColor: Colors.secondary.DEFAULT,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 12,
                elevation: 4,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                Ver Serviços
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onPress={() => {
                router.push(`/pedido/detalhes?id=${pedido.id}`);
              }}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function PedidoCard({ pedido, onPress }: { pedido: Pedido; onPress: () => void }) {
  const statusInfo = getStatusInfo(pedido.status);
  const progressInfo = getProgressInfo(pedido);
  const dataPedido = new Date(pedido.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 16, fontWeight: '800', color: Colors.text.primary, flex: 1, marginRight: 10 }}
        >
          #{pedido.numero_pedido}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, maxWidth: '55%' }}>
          {pedido.status_pagamento === 'aprovado' && (
            <View style={{
              backgroundColor: '#ECFDF5',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              marginRight: 8,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#047857' }}>PAGO</Text>
            </View>
          )}

          <Ionicons name={statusInfo.icon as any} size={18} color={statusInfo.color} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: statusInfo.color, flexShrink: 1 }}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 13, color: Colors.text.secondary, marginBottom: 8 }}>
        {dataPedido}
      </Text>

      <View style={{ marginBottom: 8 }}>
        <View style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: '#E5E7EB',
          overflow: 'hidden',
        }}>
          <View style={{
            width: `${progressInfo.percent}%`,
            height: '100%',
            backgroundColor: statusInfo.color,
          }} />
        </View>
        <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 6 }}>
          Andamento: {progressInfo.etapaAtual} ({progressInfo.percent}%)
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
          Toque para ver detalhes
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.secondary.DEFAULT }}>
          R$ {pedido.valor_final.toFixed(2).replace('.', ',')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
