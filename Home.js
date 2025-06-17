import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListaViajes from './ListaViajes';
import Add_Viaje from './Add_Viaje';
// function Add_Viaje() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.bigTitle}>Añadir viaje</Text>
//     </View>
//   );
// }
import { connect } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './login/Login';
import Viaje from './Viaje';
import Account from './login/Account';
import { addUser, setLoggedIn } from './redux/ActionCreators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

const mapStateToProps = state => {
  return {
    loggedIn: state.loggedIn
  };
}

const mapDispatchToProps = dispatch => ({
  addUser: (user) => dispatch(addUser(user)),
  setLoggedIn: (loggedIn) => dispatch(setLoggedIn(loggedIn))
});

function PagPrincipal({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName="Lista de viajes"
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 20, fontWeight: 'bold' },
        tabBarStyle: {
          height: 110, // Solo height, más alto para más margen inferior
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

function AddTripScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.bigTitle}>Añadir viaje</Text>
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

function Home({ navigation, loggedIn, user, addUser, setLoggedIn }) {

  // let control_sesion;

  // if (loggedIn.loggedIn) {
  //   if (user.user.expirationTime > Date.now()) {
  //     control_sesion = true;
  //     console.log("Session is active, user:", user.user.uid);
  //   } else {
  //     control_sesion = false;
  //     console.log("Session expired, logging out");
  //     addUser(null);
  //     setLoggedIn(false);
  //   }
  // } else {
  //   control_sesion = false;
  //   console.log("User not logged in");
  // }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const session = { uid: user.uid, expirationTime: user.stsTokenManager.expirationTime };
        setLoggedIn(true);
        addUser(session);
        console.log("User logged in: ", session.uid);
      } else {
        setLoggedIn(false);
        addUser(null);
        console.log("User not logged in");
      }
    });
    return () => unsub();
  }, []);

  return (
    <NavigationContainer>
      {loggedIn.loggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={PagPrincipal} />
          <Stack.Screen name="Viaje" component={Viaje} />
          <Stack.Screen name="Account" component={Account} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);