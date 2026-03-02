import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';

interface AguardandoAceiteProps {
  pedidoImpressaoId: string;
  parceiroNome: string;
  onAceito: () => void;
  onRecusado: () => void;
  onTimeout: () => void;
  timeoutSegundos?: number;
}

export function AguardandoAceite({
  pedidoImpressaoId,
  parceiroNome,
  onAceito,
  onRecusado,
  onTimeout,
  timeoutSegundos = 300, // 5 minutos padrão
}: AguardandoAceiteProps) {
  const [tempoRestante, setTempoRestante] = useState(timeoutSegundos);
  const [statusAtual, setStatusAtual] = useState<string>('aguardando_parceiro');

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Realtime subscription para status do pedido
    const subscription = supabase
      .channel(`pedido_impressao_${pedidoImpressaoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos_impressao',
          filter: `id=eq.${pedidoImpressaoId}`,
        },
        (payload) => {
          const novoStatus = payload.new.status;
          setStatusAtual(novoStatus);

          if (novoStatus === 'aceito') {
            clearInterval(timer);
            onAceito();
          } else if (novoStatus === 'recusado') {
            clearInterval(timer);
            onRecusado();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      subscription.unsubscribe();
    };
  }, [pedidoImpressaoId]);

  async function handleTimeout() {
    try {
      // Atualizar status para timeout no banco
      await supabase
        .from('pedidos_impressao')
        .update({ 
          status: 'timeout',
          respondido_em: new Date().toISOString(),
        })
        .eq('id', pedidoImpressaoId);

      onTimeout();
    } catch (error) {
      console.error('Erro ao processar timeout:', error);
      onTimeout();
    }
  }

  function formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  }

  function calcularProgresso(): number {
    return ((timeoutSegundos - tempoRestante) / timeoutSegundos) * 100;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {/* Animação de Loading */}
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#10B981',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 32,
          elevation: 8,
        }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>

        {/* Título */}
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: Colors.text.primary,
          textAlign: 'center',
          marginBottom: 12,
        }}>
          Aguardando Aceite da Impressão
        </Text>

        {/* Parceiro */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          elevation: 2,
        }}>
          <Ionicons name="storefront" size={24} color="#10B981" />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.text.primary,
            marginLeft: 12,
          }}>
            {parceiroNome}
          </Text>
        </View>

        {/* Tempo Restante */}
        <View style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 16,
          width: '100%',
          elevation: 4,
          marginBottom: 24,
        }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="time" size={32} color="#3B82F6" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Tempo estimado de resposta:
            </Text>
            <Text style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: tempoRestante < 60 ? '#EF4444' : '#10B981',
            }}>
              {formatarTempo(tempoRestante)}
            </Text>
          </View>

          {/* Barra de Progresso */}
          <View style={{
            height: 8,
            backgroundColor: '#E5E7EB',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              width: `${calcularProgresso()}%`,
              backgroundColor: tempoRestante < 60 ? '#EF4444' : '#10B981',
              borderRadius: 4,
            }} />
          </View>
        </View>

        {/* Informações */}
        <View style={{
          backgroundColor: '#EFF6FF',
          padding: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#3B82F6',
          width: '100%',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
                O parceiro tem até 5 minutos para aceitar sua impressão.
                {'\n\n'}
                Você será notificado assim que ele responder.
                {'\n\n'}
                Se não houver resposta, você poderá escolher outro parceiro.
              </Text>
            </View>
          </View>
        </View>

        {/* Aviso de Timeout */}
        {tempoRestante < 60 && (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
            width: '100%',
            marginTop: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="warning" size={20} color="#F59E0B" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, color: '#92400E', lineHeight: 20, fontWeight: '600' }}>
                  ⏰ Menos de 1 minuto restante!
                  {'\n'}
                  Se não houver resposta, você poderá escolher outro parceiro.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
