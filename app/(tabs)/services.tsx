import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Categoria } from '../../types';

export default function Services() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categoriasFazemosVoce, setCategoriasFazemosVoce] = useState<Categoria[]>([]);
  const [categoriasFacaVoceMesmo, setCategoriasFacaVoceMesmo] = useState<Categoria[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<'fazemos_pra_voce' | 'faca_voce_mesmo'>('fazemos_pra_voce');

  useEffect(() => {
    loadCategorias();
  }, []);

  async function loadCategorias() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;

      if (data) {
        setCategoriasFazemosVoce(data.filter(c => c.tipo === 'fazemos_pra_voce'));
        setCategoriasFacaVoceMesmo(data.filter(c => c.tipo === 'faca_voce_mesmo'));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  }

  const categorias = tipoSelecionado === 'fazemos_pra_voce' ? categoriasFazemosVoce : categoriasFacaVoceMesmo;

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
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
          Nossos Serviços 📋
        </Text>
        <Text style={{ fontSize: 16, color: Colors.text.secondary }}>
          Escolha o que precisa
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* Seletor de Tipo */}
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
            onPress={() => setTipoSelecionado('fazemos_pra_voce')}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: tipoSelecionado === 'fazemos_pra_voce' ? '#10B981' : 'transparent',
              elevation: tipoSelecionado === 'fazemos_pra_voce' ? 4 : 0,
            }}
          >
            <Text style={{ 
              fontSize: 15, 
              fontWeight: 'bold', 
              color: tipoSelecionado === 'fazemos_pra_voce' ? '#fff' : Colors.text.secondary,
              textAlign: 'center',
            }}>
              🤝 Fazemos pra Você
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTipoSelecionado('faca_voce_mesmo')}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: tipoSelecionado === 'faca_voce_mesmo' ? '#F59E0B' : 'transparent',
              elevation: tipoSelecionado === 'faca_voce_mesmo' ? 4 : 0,
            }}
          >
            <Text style={{ 
              fontSize: 15, 
              fontWeight: 'bold', 
              color: tipoSelecionado === 'faca_voce_mesmo' ? '#fff' : Colors.text.secondary,
              textAlign: 'center',
            }}>
              ✍️ Faça Você Mesmo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Badge de Desconto para Faça Você Mesmo */}
        {tipoSelecionado === 'faca_voce_mesmo' && (
          <View style={{
            backgroundColor: '#FFFBEB',
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
              🎉 20% DE DESCONTO!
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              Economize fazendo você mesmo
            </Text>
          </View>
        )}

        {/* Lista de Categorias */}
        <View style={{ marginBottom: 24 }}>
          {categorias.length === 0 ? (
            <View style={{ 
              backgroundColor: '#fff',
              padding: 32,
              borderRadius: 16,
              alignItems: 'center',
            }}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.text.secondary} />
              <Text style={{ fontSize: 16, color: Colors.text.secondary, marginTop: 12, textAlign: 'center' }}>
                Nenhum serviço disponível nesta categoria
              </Text>
            </View>
          ) : (
            categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onPress={() => {
                  router.push({
                    pathname: '/categoria/[id]',
                    params: { id: categoria.id }
                  });
                }}
              />
            ))
          )}
        </View>

        {/* Informação */}
        <View style={{
          backgroundColor: Colors.secondary.light,
          padding: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: Colors.secondary.DEFAULT,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 4 }}>
            💡 Dica
          </Text>
          <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
            {tipoSelecionado === 'fazemos_pra_voce' 
              ? 'Nós cuidamos de tudo! Você só precisa fornecer os dados.'
              : 'Você mesmo preenche e gera o documento. Rápido e econômico!'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function CategoriaCard({ categoria, onPress }: { categoria: Categoria; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: categoria.cor || Colors.primary.light,
        elevation: 4,
        shadowColor: categoria.cor || Colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: categoria.cor ? `${categoria.cor}20` : Colors.background.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}>
          <Ionicons 
            name={categoria.icone as any || 'folder'} 
            size={32} 
            color={categoria.cor || Colors.secondary.DEFAULT} 
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 4 }}>
            {categoria.nome}
          </Text>
          {categoria.descricao && (
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              {categoria.descricao}
            </Text>
          )}
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={categoria.cor || Colors.secondary.DEFAULT} 
        />
      </View>
    </TouchableOpacity>
  );
}
