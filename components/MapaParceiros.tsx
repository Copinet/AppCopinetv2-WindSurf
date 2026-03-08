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
  raioMaxKm?: number;
}

export function MapaParceiros({ 
  onParceiroSelecionado,
  onVoltar,
  servicoId, 
  precisaImpressora = true,
  raioKm = 10,
  raioMaxKm = 30,
}: MapaParceirosProps) {
  const [localizacao, setLocalizacao] = useState<Location.LocationObject | null>(null);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissaoNegada, setPermissaoNegada] = useState(false);
  const [raioSelecionadoKm, setRaioSelecionadoKm] = useState<number>(Math.min(Math.max(5, raioKm), raioMaxKm));

  useEffect(() => {
    obterLocalizacaoEParceiros();
  }, []);

  useEffect(() => {
    if (!localizacao) return;

    buscarParceirosProximos(localizacao.coords.latitude, localizacao.coords.longitude);
  }, [raioSelecionadoKm]);

  async function obterLocalizacaoEParceiros() {
    try {
      setLoading(true);

      // Em produção usar geolocalização real do cliente.
      const MODO_TESTE = false;
      
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
      console.log('📍 Localização:', { lat, lng, raio_km: raioSelecionadoKm });
      console.log('⚙️ Filtros:', { servico_id: servicoId, precisa_impressora: precisaImpressora });
      
      // Chamar função do Supabase para buscar parceiros
      const { data, error } = await supabase.rpc('buscar_parceiros_proximos', {
        lat,
        lng,
        raio_km: raioSelecionadoKm,
        servico_id: servicoId || null,
        precisa_impressora: precisaImpressora,
      });

      if (error) {
        console.error('❌ Erro ao buscar parceiros:', error);
        setParceiros([]);
      } else {
        console.log(`✅ Encontrados ${data?.length || 0} parceiros`);
        console.log('📋 Parceiros:', data);
        
        // DEBUG: Verificar distancia_metros de cada parceiro
        data?.forEach((p: any, i: number) => {
          console.log(`🔍 Parceiro ${i + 1}:`, {
            nome: p.nome_completo,
            distancia_metros: p.distancia_metros,
            tipo_distancia: typeof p.distancia_metros,
            distancia_formatada: formatarDistancia(p.distancia_metros)
          });
        });
        
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
    // Corrigido: Tratar casos de null, undefined, NaN e valores inválidos
    if (metros === null || metros === undefined || isNaN(metros) || metros < 0) {
      return '-- km';
    }
    if (metros < 1000) {
      return `${Math.round(metros)}m`;
    }
    return `${(metros / 1000).toFixed(1)} km`;
  }

  function calcularDistanciaLocalMetros(parceiro: Parceiro): number {
    if (!localizacao?.coords) return parceiro.distancia_metros;

    const lat1 = localizacao.coords.latitude;
    const lng1 = localizacao.coords.longitude;
    const lat2 = parceiro.latitude;
    const lng2 = parceiro.longitude;

    if ([lat1, lng1, lat2, lng2].some(v => !Number.isFinite(v))) {
      return parceiro.distancia_metros;
    }

    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  function getDistanciaParceiro(parceiro: Parceiro): number {
    const distanciaEmLinhaReta =
      Number.isFinite(parceiro.distancia_metros) && parceiro.distancia_metros > 0
        ? parceiro.distancia_metros
        : calcularDistanciaLocalMetros(parceiro);

    // Ajuste para aproximar da rota real de ruas (normalmente maior que linha reta).
    const distanciaKm = distanciaEmLinhaReta / 1000;
    const fatorRotaUrbana = distanciaKm > 5 ? 1.45 : distanciaKm > 2 ? 1.35 : 1.2;

    return Math.round(distanciaEmLinhaReta * fatorRotaUrbana);
  }

  function calcularTempoEstimado(parceiro: Parceiro): string {
    const distanciaMetros = getDistanciaParceiro(parceiro);
    const distanciaKm = distanciaMetros / 1000;
    // Regra solicitada: acima de 5km considerar deslocamento de carro.
    const velocidadeMediaKmH = distanciaKm > 5 ? 35 : 22;
    const minutosDeslocamento = Math.max(3, Math.round((distanciaMetros / 1000 / velocidadeMediaKmH) * 60));
    const tempoFila = parceiro.tempo_estimado_fila || 0;
    const total = minutosDeslocamento + tempoFila;
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
            Nenhum parceiro disponível no momento em um raio de {raioSelecionadoKm}km.
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
          {parceiros.length} parceiro(s) encontrado(s) em um raio de {raioSelecionadoKm}km
        </Text>

        <View style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 13, color: Colors.text.secondary, marginBottom: 8 }}>
            Raio de busca: até {raioSelecionadoKm}km
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[10, 15, 20, 25, 30].map((km) => {
              const ativo = raioSelecionadoKm === km;

              return (
                <TouchableOpacity
                  key={km}
                  onPress={() => setRaioSelecionadoKm(km)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: ativo ? '#10B981' : '#E5E7EB',
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: ativo ? '#fff' : '#4B5563' }}>
                    {km} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Lista de Parceiros */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {parceiros.map((parceiro) => {
            const distanciaMetros = getDistanciaParceiro(parceiro);

            return (
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
                    {formatarDistancia(distanciaMetros)}
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
                  const origin = localizacao?.coords
                    ? `${localizacao.coords.latitude},${localizacao.coords.longitude}`
                    : '';
                  const url = origin
                    ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${parceiro.latitude},${parceiro.longitude}&travelmode=driving`
                    : `https://www.google.com/maps/dir/?api=1&destination=${parceiro.latitude},${parceiro.longitude}&travelmode=driving`;
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
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
