import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Categoria, Servico } from '../../types';

export default function CategoriaServicos() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    loadCategoriaEServicos();
  }, [id]);

  async function loadCategoriaEServicos() {
    try {
      const { data: categoriaData, error: categoriaError } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single();

      if (categoriaError) throw categoriaError;
      setCategoria(categoriaData);

      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('*')
        .eq('categoria_id', id)
        .eq('ativo', true)
        .order('ordem');

      if (servicosError) throw servicosError;
      setServicos(servicosData || []);
    } catch (error) {
      console.error('Erro ao carregar categoria e serviços:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary }}>
        <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Carregando serviços...
        </Text>
      </View>
    );
  }

  if (!categoria) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary, padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginTop: 16, textAlign: 'center' }}>
          Categoria não encontrada
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: categoria.cor || Colors.primary.DEFAULT,
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

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons 
            name={categoria.icone as any || 'folder'} 
            size={40} 
            color="#fff" 
            style={{ marginRight: 12 }}
          />
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', flex: 1 }}>
            {categoria.nome}
          </Text>
        </View>
        
        {categoria.descricao && (
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
            {categoria.descricao}
          </Text>
        )}
      </View>

      <View style={{ padding: 20 }}>
        {/* Badge de Tipo */}
        <View style={{
          backgroundColor: categoria.tipo === 'fazemos_pra_voce' ? '#DCFCE7' : '#FFFBEB',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: categoria.tipo === 'fazemos_pra_voce' ? '#10B981' : '#F59E0B',
          elevation: 2,
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: categoria.tipo === 'fazemos_pra_voce' ? '#10B981' : '#F59E0B',
            marginBottom: 4 
          }}>
            {categoria.tipo === 'fazemos_pra_voce' ? '🤝 Fazemos pra Você' : '✍️ Faça Você Mesmo'}
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
            {categoria.tipo === 'fazemos_pra_voce' 
              ? 'Nós cuidamos de tudo! Você só fornece os dados.'
              : 'Você mesmo preenche. Economize 20%!'}
          </Text>
        </View>

        {/* Lista de Serviços */}
        {servicos.length === 0 ? (
          <View style={{ 
            backgroundColor: '#fff',
            padding: 40,
            borderRadius: 16,
            alignItems: 'center',
            elevation: 2,
          }}>
            <Ionicons name="document-outline" size={64} color={Colors.text.secondary} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginTop: 16, marginBottom: 8 }}>
              Nenhum serviço disponível
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, textAlign: 'center' }}>
              Esta categoria ainda não possui serviços cadastrados
            </Text>
          </View>
        ) : (
          servicos.map((servico) => (
            <ServicoCard
              key={servico.id}
              servico={servico}
              categoria={categoria}
              onPress={() => {
                router.push({
                  pathname: '/servico/[id]',
                  params: { id: servico.id }
                });
              }}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ServicoCard({ servico, categoria, onPress }: { servico: Servico; categoria: Categoria; onPress: () => void }) {
  const precoFinal = servico.preco_desconto || servico.preco_base;
  const temDesconto = servico.preco_desconto && servico.preco_desconto < (servico.preco_base || 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: Colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: categoria.cor || Colors.secondary.DEFAULT,
      }}
    >
      {/* Cabeçalho */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: categoria.cor ? `${categoria.cor}20` : Colors.background.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Ionicons 
            name={servico.icone as any || 'document-text'} 
            size={24} 
            color={categoria.cor || Colors.secondary.DEFAULT} 
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 4 }}>
            {servico.nome}
          </Text>
          {servico.descricao_curta && (
            <Text style={{ fontSize: 14, color: Colors.text.secondary, lineHeight: 20 }}>
              {servico.descricao_curta}
            </Text>
          )}
        </View>
      </View>

      {/* Informações */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {servico.tempo_estimado && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.background.secondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}>
            <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
            <Text style={{ fontSize: 13, color: Colors.text.secondary, marginLeft: 4 }}>
              {servico.tempo_estimado}
            </Text>
          </View>
        )}

        {servico.requer_parceiro && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#DCFCE7',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}>
            <Ionicons name="people-outline" size={16} color="#10B981" />
            <Text style={{ fontSize: 13, color: '#10B981', marginLeft: 4, fontWeight: '600' }}>
              Com Parceiro
            </Text>
          </View>
        )}
      </View>

      {/* Preço */}
      {precoFinal && (
        <View style={{ 
          backgroundColor: Colors.background.secondary,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              {temDesconto && (
                <Text style={{ 
                  fontSize: 14, 
                  color: Colors.text.secondary, 
                  textDecorationLine: 'line-through',
                  marginBottom: 2,
                }}>
                  R$ {servico.preco_base?.toFixed(2).replace('.', ',')}
                </Text>
              )}
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.secondary.DEFAULT }}>
                R$ {precoFinal.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            {temDesconto && servico.percentual_desconto && (
              <View style={{
                backgroundColor: '#10B981',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
                  -{servico.percentual_desconto}%
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Botão */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: categoria.cor || Colors.secondary.DEFAULT, marginRight: 4 }}>
          Ver Detalhes
        </Text>
        <Ionicons name="chevron-forward" size={20} color={categoria.cor || Colors.secondary.DEFAULT} />
      </View>
    </TouchableOpacity>
  );
}
