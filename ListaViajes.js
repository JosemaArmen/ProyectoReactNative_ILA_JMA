import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import app from './firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ListaViajes({ navigation }) {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const viajesRef = ref(db, 'viajes');
    const unsubscribe = onValue(viajesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, item]) => ({
          id,
          nombre: item.nombre || '',
          ubicacion: item.ubicacion || '',
          foto:
            item.fotos &&
            Array.isArray(item.fotos) &&
            item.fotos.length > 0 &&
            item.fotos[0] &&
            item.fotos[0].url
              ? item.fotos[0].url
              : null,
        }));
        setViajes(lista);
      } else {
        setViajes([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Encabezado fijo con icono como botón */}
      <View style={styles.header}>
        <Text style={styles.tituloLista}>Lista de viajes</Text>
        <TouchableOpacity
          style={styles.userIcon}
          onPress={() => {
            navigation.navigate('PerfilUsuario');
          }}
        >
          <Ionicons name="person-circle-outline" size={40} color="#2a3d66" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={viajes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Viaje', { viajeId: item.id })}
          >
            <View style={styles.itemContainer}>
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text>Sin foto</Text>
                </View>
              )}
              <Text style={styles.nombreViaje}>{item.nombre}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centra el contenido horizontalmente
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
    elevation: 4,
    position: 'relative', // Necesario para el icono absoluto
  },
  userIcon: {
    position: 'absolute',
    right: 24,
    top: 50,
  },
  itemContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  image: {
    width: 260,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  nombreViaje: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3b5998',
    textShadowColor: '#b0c4de',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  tituloLista: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2a3d66',
    textAlign: 'center', // Centra el texto
    textShadowColor: '#b0c4de',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    flex: 1,
  },
});