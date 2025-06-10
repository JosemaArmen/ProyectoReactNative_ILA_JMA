import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListaViajes from './ListaViajes';
import Add_Viaje from './Add_Viaje'; // Asegúrate de importar el componente

function TripListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.accountButton}
        onPress={() => navigation.navigate('Account')}
      >
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/747/747376.png' }} // Icono de usuario
          style={styles.accountIcon}
        />
      </TouchableOpacity>
      <ListaViajes navigation={navigation} />
    </View>
  );
}


function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text>Mi Cuenta</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function Home() {
  return (
    <Tab.Navigator
      initialRouteName="Lista de viajes"
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 20, fontWeight: 'bold' },
        tabBarStyle: {
          height: 110,
        },
      }}
    >
      <Tab.Screen
        name="Lista de viajes"
        component={TripListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828859.png' }} // Icono de lista
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Añadir viaje"
        component={Add_Viaje}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/992/992651.png' }} // Icono de +
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  accountIcon: {
    width: 36,  // antes 28
    height: 36, // antes 28
    tintColor: '#fff',
  },
  bigTitle: {
    marginTop: 60,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});