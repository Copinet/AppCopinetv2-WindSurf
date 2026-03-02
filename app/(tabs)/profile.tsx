import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

export default function Profile() {
  const router = useRouter();

  async function handleLogout() {
    console.log('Fazendo logout...');
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao sair: ' + error.message);
      } else {
        console.log('Logout bem-sucedido!');
        router.replace('/(auth)/login');
      }
    } catch (err) {
      console.error('Erro inesperado no logout:', err);
      alert('Erro inesperado: ' + (err as Error).message);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.DEFAULT }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 24 }}>
          Meu Perfil
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: Colors.error,
            padding: 18,
            borderRadius: 12,
            alignItems: 'center',
            elevation: 8,
            shadowColor: Colors.shadow.dark,
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
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
