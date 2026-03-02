import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Pedido, StatusPedido } from '../../types';

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
                // TODO: Navegar para detalhes do pedido
                console.log('Pedido selecionado:', pedido.numero_pedido);
              }}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
