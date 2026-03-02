import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

export default function Register() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !telefone || !password || !confirmPassword) {
      alert('Erro: Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('Erro: As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      alert('Erro: A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    console.log('Tentando criar conta para:', email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
            role: 'cliente',
          },
        },
      });

      console.log('Resposta do cadastro:', { data, error });

      if (error) {
        console.error('Erro no cadastro:', error);
        alert('Erro ao criar conta: ' + error.message);
      } else if (data.user) {
        console.log('Cadastro bem-sucedido!');
        router.replace('/(auth)/login');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      alert('Erro inesperado: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background.DEFAULT }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.primary.dark }}>
              Criar Conta
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginTop: 8 }}>
              Preencha seus dados para começar
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Nome Completo
            </Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              style={{
                borderWidth: 1,
                borderColor: Colors.primary.light,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: Colors.primary.light,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Telefone
            </Text>
            <TextInput
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
              style={{
                borderWidth: 1,
                borderColor: Colors.primary.light,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Senha
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: Colors.primary.light,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Confirmar Senha
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Digite a senha novamente"
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: Colors.primary.light,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: Colors.secondary.DEFAULT,
              padding: 18,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16,
              opacity: loading ? 0.6 : 1,
              elevation: 8,
              shadowColor: Colors.shadow.gold,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
            }}
          >
            <Text style={{ 
              color: Colors.text.white, 
              fontSize: 18, 
              fontWeight: 'bold',
              textShadowColor: Colors.shadow.dark,
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ color: Colors.text.secondary }}>
              Já tem conta?{' '}
              <Text style={{ color: Colors.secondary.DEFAULT, fontWeight: 'bold' }}>
                Fazer login
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
