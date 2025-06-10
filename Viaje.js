import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from './firebaseConfig';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps'; // <--- Añadido

// Reemplaza con tu propia API key de OpenCage
const OPENCAGE_API_KEY = '767486d0c0f04b80a7de4af9fa92c9bd';

async function getCountryDataFromLocation(ubicacion) {
  if (!ubicacion) return { countryCode: null, coords: null };

  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(ubicacion)}&key=${OPENCAGE_API_KEY}&language=es`
    );

    if (response.data && response.data.results.length > 0) {
      const countryCode = response.data.results[0].components['country_code'];
      const coords = response.data.results[0].geometry;
      return { countryCode, coords };
    } else {
      return { countryCode: null, coords: null };
    }
  } catch (error) {
    console.error('Error al obtener el país:', error);
    return { countryCode: null, coords: null };
  }
}

export default function Viaje({ route, navigation }) {
  const { viajeId } = route.params;
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState(null);
  const [coords, setCoords] = useState(null);
  const [mapVisible, setMapVisible] = useState(false); // Nuevo estado

  useEffect(() => {
    const fetchViaje = async () => {
      const viajeRef = ref(db, `viajes/${viajeId}`);
      const snapshot = await get(viajeRef);
      const viajeData = snapshot.val();
      setViaje(viajeData);
      if (viajeData && viajeData.ubicacion) {
        const { countryCode, coords } = await getCountryDataFromLocation(viajeData.ubicacion);
        setCountryCode(countryCode);
        setCoords(coords);
      }
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
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
            style={styles.backArrowImg}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.ubicacionContainer}>
        {countryCode && (
          <Image
            source={{ uri: `https://flagcdn.com/32x24/${countryCode}.png` }}
            style={{ width: 32, height: 24, marginRight: 8, borderRadius: 4 }}
          />
        )}
        <Text style={styles.title}>{viaje.ubicacion}</Text>
        {countryCode && (
          <Image
            source={{ uri: `https://flagcdn.com/32x24/${countryCode}.png` }}
            style={{ width: 32, height: 24, marginLeft: 0, borderRadius: 4 }}
          />
        )}
      </View>
      {coords && (
        <TouchableOpacity onPress={() => setMapVisible(true)} activeOpacity={0.8}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            pointerEvents="none" // Para que el mapa pequeño no sea interactivo
          >
            <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
          </MapView>
        </TouchableOpacity>
      )}
      {/* Modal para el mapa grande */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <MapView
            style={styles.fullMap}
            initialRegion={{
              latitude: coords?.lat || 0,
              longitude: coords?.lng || 0,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={{ latitude: coords?.lat || 0, longitude: coords?.lng || 0 }} />
          </MapView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setMapVisible(false)}>
            <Text style={styles.closeButtonText}>Cerrar mapa</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2a3d66',
    marginRight: 8,
    textShadowColor: '#b0c4de',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  map: {
    width: 320,
    height: 180,
    borderRadius: 12,
    marginBottom: 18,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullMap: {
    width: '100%',
    height: '85%',
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#2a3d66',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});