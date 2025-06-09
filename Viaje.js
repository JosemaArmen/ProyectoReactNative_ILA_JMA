import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from './firebaseConfig';

export default function Viaje({ route, navigation }) {
  const { viajeId } = route.params;
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViaje = async () => {
      const viajeRef = ref(db, `viajes/${viajeId}`);
      const snapshot = await get(viajeRef);
      setViaje(snapshot.val());
      setLoading(false);
    };
    fetchViaje();
  }, [viajeId]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  if (!viaje) return <Text>No encontrado</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backArrowCircle}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }} // Icono de flecha más bonito
            style={styles.backArrowImg}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.ubicacionContainer}>
        <Text style={styles.title}>{viaje.ubicacion}</Text>
        {/* Bandera eliminada */}
      </View>
      <View style={styles.fechaArtContainer}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png' }}
          style={styles.iconoFecha}
        />
        <Text style={styles.fechaArt}>{viaje.fecha}</Text>
      </View>
      <View style={styles.tiempoContainer}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png' }}
          style={styles.iconoTiempo}
        />
        <Text style={styles.tiempoArt}>{viaje.tiempo}</Text>
      </View>
      {viaje.fotos && Array.isArray(viaje.fotos) && viaje.fotos.map((foto, idx) => (
        <Image key={idx} source={{ uri: foto }} style={styles.image} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, paddingTop: 0 },
  backButton: {
    position: 'absolute',
    top: 38, // MÁS espacio con el techo
    left: 16,
    zIndex: 10,
  },
  backArrowCircle: {
    backgroundColor: '#f0f4ff',
    borderRadius: 24,
    padding: 8,
    borderWidth: 2,
    borderColor: '#b0c4de',
    shadowColor: '#b0c4de',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowImg: {
    width: 28,
    height: 28,
    tintColor: '#2a3d66',
  },
  ubicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2a3d66',
    marginRight: 12,
    textShadowColor: '#b0c4de',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  fechaArtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#e6e6fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#b39ddb',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  iconoFecha: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  fechaArt: {
    fontSize: 24,
    fontFamily: 'serif',
    color: '#6a5acd',
    fontWeight: 'bold',
    textShadowColor: '#d1c4e9',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tiempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#fff3e0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#ffe0b2',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  iconoTiempo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  tiempoArt: {
    fontSize: 24,
    fontFamily: 'serif',
    color: '#ff9800',
    fontWeight: 'bold',
    textShadowColor: '#ffe0b2',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginRight: 10,
  },
  image: { width: 300, height: 200, borderRadius: 12, marginBottom: 10 },
});