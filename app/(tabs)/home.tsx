import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Categoria } from '../../types';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    loadUserName();
    loadCategorias();
  }, []);

  async function loadUserName() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.nome) {
      setUserName(user.user_metadata.nome.split(' ')[0]);
    }
  }

  async function loadCategorias() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem');
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  function handleWhatsApp() {
    Linking.openURL('https://wa.me/5513988813785');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      {/* Header com saudação */}
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
          Olá{userName ? `, ${userName}` : ''}! 👋
        </Text>
        <Text style={{ fontSize: 18, color: Colors.text.secondary }}>
          Como podemos ajudar hoje?
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        {/* Cards Principais - Fazemos pra Você / Faça Você Mesmo */}
        <View style={{ marginBottom: 24 }}>
          <MainServiceCard
            icon="handshake"
            iconColor="#10B981"
            title="🤝 FAZEMOS PRA VOCÊ"
            subtitle="Deixa com a gente!"
            description="Nós resolvemos tudo por você"
            backgroundColor="#ECFDF5"
            borderColor="#10B981"
            onPress={() => router.push({ pathname: '/(tabs)/services', params: { tipo: 'fazemos_pra_voce' } })}
          />
          
          <MainServiceCard
            icon="create"
            iconColor="#F59E0B"
            title="✍️ FAÇA VOCÊ MESMO"
            subtitle="Mais barato! 20% desconto"
            description="Rápido e econômico"
            backgroundColor="#FFFBEB"
            borderColor="#F59E0B"
            onPress={() => router.push({ pathname: '/(tabs)/services', params: { tipo: 'faca_voce_mesmo' } })}
          />
        </View>

        {/* Botão de Suporte */}
        <TouchableOpacity
          onPress={handleWhatsApp}
          style={{
            backgroundColor: '#25D366',
            padding: 20,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            elevation: 8,
            shadowColor: '#25D366',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
          }}
        >
          <Ionicons name="logo-whatsapp" size={32} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
              PRECISA DE AJUDA?
            </Text>
            <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9 }}>
              Fale com nosso suporte
            </Text>
          </View>
        </TouchableOpacity>

        {/* BOTÃO IMPRESSÃO RÁPIDA - CARRO CHEFE */}
        <TouchableOpacity
          onPress={() => router.push('/impressao-rapida')}
          style={{
            backgroundColor: '#10B981',
            padding: 24,
            borderRadius: 20,
            marginBottom: 32,
            elevation: 12,
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            borderWidth: 3,
            borderColor: '#059669',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.25)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="print" size={32} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
                🖨️ IMPRESSÃO RÁPIDA
              </Text>
              <Text style={{ fontSize: 16, color: '#fff', opacity: 0.95, fontWeight: '600' }}>
                Documentos e Fotos
              </Text>
            </View>
          </View>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 14, color: '#fff', lineHeight: 20 }}>
              📄 Documentos • 📸 Fotos
            </Text>
          </View>
          <View style={{
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#10B981',
              textShadowColor: 'rgba(0,0,0,0.1)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}>
              CLIQUE AQUI PARA IMPRIMIR
            </Text>
          </View>
        </TouchableOpacity>

        {/* Serviços Mais Usados */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
            Serviços Mais Usados:
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {categorias.slice(0, 4).map((categoria) => (
              <QuickServiceCard 
                key={categoria.id}
                icon={categoria.icone as any}
                title={categoria.nome}
                color={categoria.cor}
                onPress={() => router.push({ pathname: '/categoria/[id]', params: { id: categoria.id } })}
              />
            ))}
          </View>
        </View>

        {/* Informação importante */}
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
            Máximo 3 cliques para qualquer serviço!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function MainServiceCard({ 
  icon, 
  iconColor, 
  title, 
  subtitle, 
  description, 
  backgroundColor, 
  borderColor,
  onPress 
}: { 
  icon: any; 
  iconColor: string; 
  title: string; 
  subtitle: string; 
  description: string; 
  backgroundColor: string; 
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor,
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 3,
        borderColor,
        elevation: 6,
        shadowColor: borderColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Ionicons name={icon} size={40} color={iconColor} />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary }}>
            {title}
          </Text>
          <Text style={{ fontSize: 16, color: iconColor, fontWeight: '600', marginTop: 2 }}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 15, color: Colors.text.secondary, marginBottom: 12 }}>
        {description}
      </Text>
      <View style={{
        backgroundColor: borderColor,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
      }}>
        <Text style={{ 
          fontSize: 17, 
          fontWeight: 'bold', 
          color: '#fff',
          textShadowColor: Colors.shadow.dark,
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}>
          CLIQUE AQUI
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function QuickServiceCard({ icon, title, color, onPress }: { icon: any; title: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        width: '48%',
        marginBottom: 12,
        alignItems: 'center',
        elevation: 4,
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: color,
      }}
    >
      <Ionicons name={icon} size={36} color={color} />
      <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.text.primary, marginTop: 8, textAlign: 'center' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
