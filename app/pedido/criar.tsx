import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import type { Servico, Categoria } from '../../types';
import { validarCPF, formatarCPF, validarData, formatarData, validarTelefone, formatarTelefone, validarEmail } from '../../lib/validators';

export default function CriarPedido() {
  const router = useRouter();
  const { servicoId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [servico, setServico] = useState<Servico | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    loadServico();
  }, [servicoId]);

  async function loadServico() {
    try {
      const { data: servicoData, error: servicoError } = await supabase
        .from('servicos')
        .select('*')
        .eq('id', servicoId)
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

  async function handleSubmit() {
    if (!servico || !categoria) return;

    // Validação básica
    if (servico.requer_dados_cliente) {
      const camposObrigatorios = servico.campos_formulario?.filter((c: any) => c.obrigatorio) || [];
      const camposFaltando = camposObrigatorios.filter((c: any) => !formData[c.nome]);
      
      if (camposFaltando.length > 0) {
        alert(`Por favor, preencha todos os campos obrigatórios: ${camposFaltando.map((c: any) => c.label).join(', ')}`);
        return;
      }

      // Validações específicas
      for (const campo of servico.campos_formulario || []) {
        const valor = formData[campo.nome];
        if (!valor && !campo.obrigatorio) continue;

        if (campo.validacao === 'cpf' && !validarCPF(valor)) {
          alert(`CPF inválido! Verifique o campo ${campo.label}`);
          return;
        }
        if (campo.validacao === 'data' && !validarData(valor)) {
          alert(`Data inválida! Use o formato DD/MM/AAAA no campo ${campo.label}`);
          return;
        }
        if (campo.tipo === 'telefone' && !validarTelefone(valor)) {
          alert(`Telefone inválido! Use o formato (XX)XXXXX-XXXX no campo ${campo.label}`);
          return;
        }
        if (campo.tipo === 'email' && !validarEmail(valor)) {
          alert(`Email inválido! Verifique o campo ${campo.label}`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para criar um pedido');
        router.push('/(auth)/login');
        return;
      }

      const precoFinal = servico.preco_desconto || servico.preco_base || 0;
      const desconto = (servico.preco_base || 0) - precoFinal;

      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: user.id,
          servico_id: servico.id,
          tipo_servico: categoria.tipo,
          dados_formulario: formData,
          valor_total: servico.preco_base || 0,
          valor_desconto: desconto,
          valor_final: precoFinal,
          status: 'aguardando_pagamento',
          status_pagamento: 'pendente',
          metodo_pagamento: 'pix',
          observacoes: observacoes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Navegar para tela de pagamento
      router.push({
        pathname: '/pedido/pagamento',
        params: { pedidoId: pedido.id }
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary }}>
        <ActivityIndicator size="large" color={Colors.secondary.DEFAULT} />
        <Text style={{ marginTop: 16, fontSize: 16, color: Colors.text.secondary }}>
          Carregando formulário...
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

  const precoFinal = servico.preco_desconto || servico.preco_base || 0;
  const campos = servico.campos_formulario || [];

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

          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 }}>
            Solicitar Serviço 📝
          </Text>
          <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
            {servico.nome}
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Informação */}
          <View style={{
            backgroundColor: '#EFF6FF',
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#3B82F6',
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 }}>
              💡 Atenção
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
              Preencha os dados com atenção. Informações incorretas podem atrasar seu pedido.
            </Text>
          </View>

          {/* Formulário Dinâmico */}
          {servico.requer_dados_cliente && campos.length > 0 ? (
            <View style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 16,
              marginBottom: 20,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
                📋 Dados Necessários
              </Text>

              {campos.map((campo: any, index: number) => (
                <View key={index} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 }}>
                    {campo.label} {campo.obrigatorio && <Text style={{ color: '#EF4444' }}>*</Text>}
                  </Text>
                  
                  {campo.tipo === 'texto' || campo.tipo === 'email' || campo.tipo === 'telefone' ? (
                    <TextInput
                      value={formData[campo.nome] || ''}
                      onChangeText={(text) => {
                        let valorFormatado = text;
                        
                        // Aplicar formatação automática
                        if (campo.validacao === 'cpf') {
                          valorFormatado = formatarCPF(text);
                        } else if (campo.validacao === 'data') {
                          valorFormatado = formatarData(text);
                        } else if (campo.tipo === 'telefone') {
                          valorFormatado = formatarTelefone(text);
                        }
                        
                        setFormData({ ...formData, [campo.nome]: valorFormatado });
                      }}
                      placeholder={campo.placeholder || `Digite ${campo.label.toLowerCase()}`}
                      keyboardType={
                        campo.tipo === 'email' ? 'email-address' :
                        campo.tipo === 'telefone' ? 'phone-pad' : 
                        campo.validacao === 'cpf' ? 'numeric' :
                        campo.validacao === 'data' ? 'numeric' : 'default'
                      }
                      maxLength={
                        campo.validacao === 'cpf' ? 14 :
                        campo.validacao === 'data' ? 10 :
                        campo.tipo === 'telefone' ? 15 : undefined
                      }
                      style={{
                        backgroundColor: Colors.background.secondary,
                        padding: 14,
                        borderRadius: 12,
                        fontSize: 16,
                        color: Colors.text.primary,
                        borderWidth: 1,
                        borderColor: formData[campo.nome] ? categoria.cor || Colors.secondary.DEFAULT : '#E5E7EB',
                      }}
                    />
                  ) : campo.tipo === 'textarea' ? (
                    <TextInput
                      value={formData[campo.nome] || ''}
                      onChangeText={(text) => setFormData({ ...formData, [campo.nome]: text })}
                      placeholder={campo.placeholder || `Digite ${campo.label.toLowerCase()}`}
                      multiline
                      numberOfLines={4}
                      style={{
                        backgroundColor: Colors.background.secondary,
                        padding: 14,
                        borderRadius: 12,
                        fontSize: 16,
                        color: Colors.text.primary,
                        borderWidth: 1,
                        borderColor: formData[campo.nome] ? categoria.cor || Colors.secondary.DEFAULT : '#E5E7EB',
                        minHeight: 100,
                        textAlignVertical: 'top',
                      }}
                    />
                  ) : null}

                  {campo.ajuda && (
                    <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4 }}>
                      {campo.ajuda}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{
              backgroundColor: '#DCFCE7',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>
                ✅ Serviço Automático
              </Text>
              <Text style={{ fontSize: 14, color: Colors.text.secondary }}>
                Este serviço não requer dados adicionais. Você pode prosseguir direto para o pagamento!
              </Text>
            </View>
          )}

          {/* Observações */}
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
              💬 Observações (Opcional)
            </Text>
            <TextInput
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Alguma informação adicional que queira nos passar?"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: Colors.background.secondary,
                padding: 14,
                borderRadius: 12,
                fontSize: 16,
                color: Colors.text.primary,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Resumo do Pedido */}
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 16,
            marginBottom: 20,
            elevation: 4,
            borderWidth: 2,
            borderColor: categoria.cor || Colors.secondary.DEFAULT,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 }}>
              📊 Resumo do Pedido
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
                Serviço
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                {servico.nome}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 4 }}>
                Categoria
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                {categoria.nome}
              </Text>
            </View>

            <View style={{ 
              borderTopWidth: 1, 
              borderTopColor: Colors.background.secondary,
              paddingTop: 12,
              marginTop: 12,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.text.primary }}>
                  Valor Total
                </Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.secondary.DEFAULT }}>
                  R$ {precoFinal.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          </View>
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
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#9CA3AF' : (categoria.cor || Colors.secondary.DEFAULT),
            paddingVertical: 18,
            borderRadius: 16,
            elevation: 6,
            shadowColor: categoria.cor || Colors.shadow.metallic,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ 
              color: '#fff', 
              fontSize: 18, 
              fontWeight: 'bold', 
              textAlign: 'center',
            }}>
              Ir para Pagamento 💳
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
