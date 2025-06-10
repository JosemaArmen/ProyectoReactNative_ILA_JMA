import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Login from './login/login';
import UsuarioLogueado from './login/usuarioLogueado';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import Viaje from './Viaje';

const Stack = createNativeStackNavigator();

export default function App() {

  const [user, setUser] = React.useState(null);

  let contenido;
  if (user) {
    contenido =
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Viaje" component={Viaje} />
        </Stack.Navigator>
      </NavigationContainer>;
  } else {
    contenido = <Login setUser={setUser} />;
  }

  return (
    <View style={styles.container}>
      { contenido}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
