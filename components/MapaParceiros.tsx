import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';

interface Parceiro {
  id: string;
  nome_completo: string;
  endereco_completo: string;
  distancia_metros: number;
  ranking_score: number;
  fila_atual: number;
  tempo_estimado_fila: number;
  latitude: number;
  longitude: number;
  is_loja_propria: boolean;
}

interface MapaParceirosProps {
  onParceiroSelecionado: (parceiro: Parceiro) => void;
  onVoltar?: () => void;
  servicoId?: string;
  precisaImpressora?: boolean;
  raioKm?: number;
}

export function MapaParceiros({ 
  onParceiroSelecionado,
  onVoltar,
  servicoId, 
  precisaImpressora = true,
  raioKm = 10 
}: MapaParceirosProps) {
  const [localizacao, setLocalizacao] = useState<Location.LocationObject | null>(null);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissaoNegada, setPermissaoNegada] = useState(false);

  useEffect(() => {
    obterLocalizacaoEParceiros();
  }, []);

  async function obterLocalizacaoEParceiros() {
    try {
      setLoading(true);

      // MODO DE TESTE: Usar localização simulada (Cubatão, SP - Centro)
      const MODO_TESTE = true; // Altere para false em produção
      
      if (MODO_TESTE) {
        console.log('🧪 MODO DE TESTE: Usando localização simulada (Cubatão, SP - Centro)');
        const locationSimulada = {
          coords: {
            latitude: -23.8950,
            longitude: -46.4250,
            altitude: null,
            accuracy: 100,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        
        setLocalizacao(locationSimulada as any);
        await buscarParceirosProximos(
          locationSimulada.coords.latitude,
          locationSimulada.coords.longitude
        );
        return;
      }

      // Solicitar permissão de localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setPermissaoNegada(true);
        Alert.alert(
          'Permissão Necessária',
          'Precisamos da sua localização para encontrar parceiros próximos.'
        );
        setLoading(false);
        return;
      }

      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocalizacao(location);

      // Buscar parceiros próximos
      await buscarParceirosProximos(
        location.coords.latitude,
        location.coords.longitude
      );

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
      setLoading(false);
    }
  }

  async function buscarParceirosProximos(lat: number, lng: number) {
    try {
      console.log('🔍 Buscando parceiros próximos...');
      console.log('📍 Localização:', { lat, lng, raio_km: raioKm });
      console.log('⚙️ Filtros:', { servico_id: servicoId, precisa_impressora: precisaImpressora });
      
      // Chamar função do Supabase para buscar parceiros
      const { data, error } = await supabase.rpc('buscar_parceiros_proximos', {
        lat,
        lng,
        raio_km: raioKm,
        servico_id: servicoId || null,
        precisa_impressora: precisaImpressora,
      });

      if (error) {
        console.error('❌ Erro ao buscar parceiros:', error);
        setParceiros([]);
      } else {
        console.log(`✅ Encontrados ${data?.length || 0} parceiros`);
        console.log('📋 Parceiros:', data);
        setParceiros(data || []);
      }
    } catch (error) {
      console.error('❌ Erro na busca de parceiros:', error);
      setParceiros([]);
    } finally {
      setLoading(false);
    }
  }

  function formatarDistancia(metros: number): string {
    if (!metros || isNaN(metros)) {
      return '-- km';
    }
    if (metros < 1000) {
      return `${Math.round(metros)}m`;
    }
    return `${(metros / 1000).toFixed(1)}km`;
  }

  function calcularTempoEstimado(parceiro: Parceiro): string {
    const tempoBase = 15; // 15 minutos base
    const tempoFila = parceiro.tempo_estimado_fila || 0;
    const total = tempoBase + tempoFila;
    return `${total} min`;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Buscando parceiros próximos...
        </Text>
      </View>
    );
  }

  if (permissaoNegada) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{
          backgroundColor: '#FEF3C7',
          padding: 20,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#F59E0B',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#92400E', marginLeft: 12 }}>
              Permissão Necessária
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#78350F', lineHeight: 20 }}>
            Para encontrar parceiros próximos, precisamos acessar sua localização.
            {'\n\n'}
            Vá em Configurações → Copinet → Localização → Permitir
          </Text>
        </View>
      </View>
    );
  }

  if (parceiros.length === 0) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{
          backgroundColor: '#FEE2E2',
          padding: 20,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#EF4444',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#991B1B', marginLeft: 12 }}>
              Impressão Indisponível
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#7F1D1D', lineHeight: 20 }}>
            Nenhum parceiro disponível no momento em um raio de {raioKm}km.
            {'\n\n'}
            Isso pode acontecer fora do horário de funcionamento ou em finais de semana.
            {'\n\n'}
            Por favor, tente novamente mais tarde.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        {onVoltar && (
          <TouchableOpacity 
            onPress={onVoltar}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#10B981" />
            <Text style={{ fontSize: 16, color: '#10B981', marginLeft: 8, fontWeight: '600' }}>
              Voltar
            </Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 4 }}>
          📍 Parceiros Próximos
        </Text>
        <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
          {parceiros.length} parceiro(s) encontrado(s) em um raio de {raioKm}km
        </Text>
      </View>

      {/* Lista de Parceiros */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {parceiros.map((parceiro, index) => (
            <TouchableOpacity
              key={parceiro.id}
              onPress={() => onParceiroSelecionado(parceiro)}
              style={{
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 16,
                marginBottom: 16,
                elevation: 4,
                borderLeftWidth: 4,
                borderLeftColor: parceiro.is_loja_propria ? '#10B981' : '#3B82F6',
              }}
            >
              {/* Badge Loja Própria */}
              {parceiro.is_loja_propria && (
                <View style={{
                  backgroundColor: '#10B981',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                    ⭐ LOJA COPINET
                  </Text>
                </View>
              )}

              {/* Nome e Ranking */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="storefront" size={24} color="#10B981" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary }}>
                    {parceiro.nome_completo}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={{ fontSize: 13, color: Colors.text.secondary, marginLeft: 4 }}>
                      Ranking: {parceiro.ranking_score}/100
                    </Text>
                  </View>
                </View>
              </View>

              {/* Endereço */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <Ionicons name="location" size={16} color="#6B7280" style={{ marginTop: 2 }} />
                <Text style={{ 
                  fontSize: 14, 
                  color: Colors.text.secondary, 
                  marginLeft: 8,
                  flex: 1,
                }}>
                  {parceiro.endereco_completo}
                </Text>
              </View>

              {/* Informações */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="navigate" size={20} color="#3B82F6" />
                  <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4 }}>
                    {formatarDistancia(parceiro.distancia_metros)}
                  </Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="time" size={20} color="#8B5CF6" />
                  <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4 }}>
                    {calcularTempoEstimado(parceiro)}
                  </Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="people" size={20} color="#F59E0B" />
                  <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4 }}>
                    Fila: {parceiro.fila_atual}
                  </Text>
                </View>
              </View>

              {/* Botão Ver no Mapa */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${parceiro.latitude},${parceiro.longitude}`;
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Erro', 'Não foi possível abrir o mapa');
                  });
                }}
                style={{
                  backgroundColor: '#3B82F6',
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="map" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                  Ver Rota no Mapa
                </Text>
              </TouchableOpacity>

              {/* Botão Selecionar */}
              <View style={{
                backgroundColor: '#10B981',
                padding: 12,
                borderRadius: 8,
                marginTop: 8,
                alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                  Selecionar Este Parceiro
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
