import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert('Erro: Preencha todos os campos');
      return;
    }

    setLoading(true);
    console.log('Tentando fazer login com:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Resposta do login:', { data, error });

      if (error) {
        console.error('Erro no login:', error);
        alert('Erro ao fazer login: ' + error.message);
      } else if (data.session) {
        console.log('Login bem-sucedido!');
        router.replace('/(tabs)/home');
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
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.primary.dark }}>
              Copinet
            </Text>
            <Text style={{ fontSize: 18, color: Colors.secondary.DEFAULT, marginTop: 8 }}>
              Serviços Digitais
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
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

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 14, color: Colors.text.secondary, marginBottom: 8 }}>
              Senha
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
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
            onPress={handleLogin}
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
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ color: Colors.text.secondary }}>
              Não tem conta?{' '}
              <Text style={{ color: Colors.secondary.DEFAULT, fontWeight: 'bold' }}>
                Cadastre-se
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
