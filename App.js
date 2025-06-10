import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Login from './login/login';
import UsuarioLogueado from './login/usuarioLogueado';

export default function App() {

  const [user, setUser] = React.useState(null);

  let contenido;
  if (user) {
    contenido = <UsuarioLogueado user={user} />;
  } else {
    contenido = <Login setUser={setUser} />;
  }

  return (
    <View style={styles.container}>
      {contenido}
      <StatusBar style="auto" />
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
