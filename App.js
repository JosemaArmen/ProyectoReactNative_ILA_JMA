import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function TripListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Botón superior "Mi cuenta" */}
      <TouchableOpacity
        style={styles.accountButton}
        onPress={() => navigation.navigate('Account')}
      >
        <Text style={styles.accountButtonText}>Mi Cuenta</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 60, fontSize: 18 }}>Lista de Viajes</Text>
    </View>
  );
}

function AddTripScreen() {
  return (
    <View style={styles.container}>
      <Text>Añadir Viaje</Text>
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
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Lista de Viajes"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Lista de Viajes" component={TripListScreen} />
      <Tab.Screen name="Añadir Viaje" component={AddTripScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Account" component={AccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
  },
});