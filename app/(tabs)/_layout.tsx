import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary.DEFAULT,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 15,
          paddingTop: 15,
          elevation: 20,
          shadowColor: Colors.shadow.dark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginTop: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        headerStyle: {
          backgroundColor: Colors.primary.DEFAULT,
          elevation: 8,
          shadowColor: Colors.shadow.metallic,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={28} 
              color={color}
              style={{ 
                textShadowColor: focused ? Colors.shadow.gold : 'transparent',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'briefcase' : 'briefcase-outline'} 
              size={28} 
              color={color}
              style={{ 
                textShadowColor: focused ? Colors.shadow.gold : 'transparent',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'document-text' : 'document-text-outline'} 
              size={28} 
              color={color}
              style={{ 
                textShadowColor: focused ? Colors.shadow.gold : 'transparent',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={28} 
              color={color}
              style={{ 
                textShadowColor: focused ? Colors.shadow.gold : 'transparent',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
