import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Servico, Categoria } from '../../types';

export default function ServicoDetalhes() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [servico, setServico] = useState<Servico | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);

  useEffect(() => {
    loadServico();
  }, [id]);

  async function loadServico() {
    try {
      const { data: servicoData, error: servicoError } = await supabase
        .from('servicos')
        .select('*')
        .eq('id', id)
        .single();

      if (servicoError) throw servicoError;
      setServico(servicoData);

      const { data: categoriaData, error: categoriaError } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', servicoData.categoria_id)
        .single();

      if (categoriaError) throw categoriaError;
      setCategoria(categoriaData);
    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
    } finally {
      setLoading(false);
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

  if (!servico || !categoria) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary, padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.text.secondary} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginTop: 16, textAlign: 'center' }}>
          Serviço não encontrado
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

  const precoFinal = servico.preco_desconto || servico.preco_base;
  const temDesconto = servico.preco_desconto && servico.preco_desconto < (servico.preco_base || 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <ScrollView>
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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons 
                name={servico.icone as any || 'document-text'} 
                size={36} 
                color="#fff" 
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                {servico.nome}
              </Text>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9 }}>
                {categoria.nome}
              </Text>
            </View>
          </View>
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

          {/* Descrição */}
          {servico.descricao && (
            <View style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 16,
              marginBottom: 20,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
                📝 Sobre este serviço
              </Text>
              <Text style={{ fontSize: 15, color: Colors.text.secondary, lineHeight: 24 }}>
                {servico.descricao}
              </Text>
            </View>
          )}

          {/* Informações */}
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

            {servico.tempo_estimado && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: Colors.background.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="time-outline" size={22} color={Colors.secondary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 2 }}>
                    Tempo estimado
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                    {servico.tempo_estimado}
                  </Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: Colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Ionicons 
                  name={servico.requer_parceiro ? 'people' : 'person'} 
                  size={22} 
                  color={Colors.secondary.DEFAULT} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 2 }}>
                  Execução
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                  {servico.requer_parceiro ? 'Com parceiro especializado' : 'Automático pelo sistema'}
                </Text>
              </View>
            </View>

            {servico.requer_dados_cliente && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: Colors.background.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="clipboard-outline" size={22} color={Colors.secondary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 2 }}>
                    Dados necessários
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                    Você precisará fornecer algumas informações
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Preço */}
          {precoFinal && (
            <View style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 16,
              marginBottom: 20,
              elevation: 4,
              borderWidth: 2,
              borderColor: categoria.cor || Colors.secondary.DEFAULT,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
                💰 Valor
              </Text>

              {temDesconto && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    color: Colors.text.secondary, 
                    textDecorationLine: 'line-through',
                  }}>
                    De: R$ {servico.preco_base?.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
                    {temDesconto ? 'Por apenas:' : 'Valor:'}
                  </Text>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.secondary.DEFAULT }}>
                    R$ {precoFinal.toFixed(2).replace('.', ',')}
                  </Text>
                </View>

                {temDesconto && servico.percentual_desconto && (
                  <View style={{
                    backgroundColor: '#10B981',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                      -{servico.percentual_desconto}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View style={{
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 24,
        elevation: 12,
        shadowColor: Colors.shadow.dark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/pedido/criar',
              params: { servicoId: servico.id }
            });
          }}
          style={{
            backgroundColor: categoria.cor || Colors.secondary.DEFAULT,
            paddingVertical: 18,
            borderRadius: 16,
            elevation: 6,
            shadowColor: categoria.cor || Colors.shadow.metallic,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          <Text style={{ 
            color: '#fff', 
            fontSize: 18, 
            fontWeight: 'bold', 
            textAlign: 'center',
          }}>
            Solicitar Serviço 🚀
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
