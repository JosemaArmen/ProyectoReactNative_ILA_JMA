import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListaViajes from './ListaViajes';

function TripListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.accountButton}
        onPress={() => navigation.navigate('Account')}
      >
        <Text style={styles.accountButtonText}>Mi Cuenta</Text>
      </TouchableOpacity>
      <Text style={styles.bigTitle}>Lista de Viajes</Text>
      <ListaViajes />
    </View>
  );
}

function AddTripScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.bigTitle}>Añadir Viaje</Text>
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

export default function Home({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName="Lista de Viajes"
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 22, fontWeight: 'bold' },
      }}
    >
      <Tab.Screen name="Lista de Viajes" component={TripListScreen} />
      <Tab.Screen name="Añadir Viaje" component={AddTripScreen} />
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
  accountButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bigTitle: {
    marginTop: 60,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});