import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from './firebaseConfig';
import axios from 'axios';
import MapView, { Marker } from './MapView';

export default function Viaje({ route, navigation }) {
  console.log('Viaje COMPONENTE MONTADO');
  console.log('route:', route);
  console.log('route.params:', route?.params);

  const { viajeId } = route.params;
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState(null);
  const [coords, setCoords] = useState(null);
  const [mapVisible, setMapVisible] = useState(false); // Nuevo estado
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoCountryCodes, setPhotoCountryCodes] = useState({});

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

  useEffect(() => {
    const fetchViaje = async () => {
      const viajeRef = ref(db, `viajes/${viajeId}`);
      const snapshot = await get(viajeRef);
      const viajeData = snapshot.val();
      console.log('Datos de viaje:', viajeData); // <-- Añade esto
      setViaje(viajeData);

      // Obtener countryCode y coords del viaje principal
      if (viajeData && viajeData.ubicacion) {
        const { countryCode, coords } = await getCountryDataFromLocation(viajeData.ubicacion);
        setCountryCode(countryCode);
        setCoords(coords);
      }

      // Obtener countryCode de cada foto
      if (viajeData && viajeData.fotos && Array.isArray(viajeData.fotos)) {
        const codes = {};
        await Promise.all(
          viajeData.fotos.map(async (foto, idx) => {
            if (foto.ubicacion) {
              const { countryCode } = await getCountryDataFromLocation(foto.ubicacion);
              codes[idx] = countryCode;
            }
          })
        );
        setPhotoCountryCodes(codes);
      }

      setLoading(false);
    };
    fetchViaje();
  }, [viajeId]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  if (!viaje) return <Text>No encontrado</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* Encabezado fijo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backArrowCircle}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/271/271220.png' }}
              style={styles.backArrowImg}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {viaje.nombre}
          </Text>
        </View>
      </View>
      {/* Contenido scrollable */}
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: 110 }]}>
        {/* 3. Usa MapView y Marker solo si existen */}
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
              pointerEvents="none"
            >
              <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
            </MapView>
          </TouchableOpacity>
        )}
        {/* Modal para el mapa grande */}
        <Modal visible={mapVisible} animationType="slide">
          <View style={styles.modalContainer}>
            {/* 4. También aquí, verifica MapView y Marker */}
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
          foto.url ? (
            <View key={idx} style={styles.fotoContainer}>
              <View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedPhoto(foto);
                    setPhotoModalVisible(true);
                  }}
                >
                  <View>
                    <Image source={{ uri: foto.url }} style={styles.image} />
                    {photoCountryCodes[idx] && (
                      <Image
                        source={{ uri: `https://flagcdn.com/32x24/${photoCountryCodes[idx].toLowerCase()}.png` }}
                        style={styles.banderaFoto}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              {foto.ubicacion && (
                <Text style={styles.fotoUbicacion}>
                  {foto.ubicacion}
                </Text>
              )}
            </View>
          ) : null
        ))}
        {/* Modal para la foto seleccionada */}
        <Modal visible={photoModalVisible} transparent={true} animationType="fade">
          <View style={styles.photoModalContainer}>
            <Image
              source={{ uri: selectedPhoto?.url }}
              style={styles.fullPhoto}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closePhotoButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar foto</Text>
            </TouchableOpacity>
            {selectedPhoto?.ubicacion && (
              <Text style={styles.fotoUbicacion}>{selectedPhoto.ubicacion}</Text>
            )}
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, paddingTop: 0 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 38,
    paddingHorizontal: 16,
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ef',
    elevation: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginRight: 10,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#2a3d66',
    marginRight: 8,
    textShadowColor: '#b0c4de',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    flexShrink: 1, // <-- Añadido para que el texto se ajuste
    maxWidth: '100%', // <-- Opcional, asegura que no se desborde
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
    marginHorizontal: 16, // <-- Añadido
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
    marginHorizontal: 16, // <-- Añadido
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
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: '#f8f9fa',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#b0c4de',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e7ef',
  },
  fotoUbicacion: {
    marginTop: 8,
    fontSize: 18,
    color: '#3a3d66',
    fontWeight: '600',
    fontFamily: 'serif',
    textAlign: 'center',
    backgroundColor: '#e6e6fa',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#b0c4de',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    letterSpacing: 1,
  },
  // ...otros estilos...
  closeButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  closeButton: {
    elevation: 4,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2a3d66',
    alignSelf: 'center',
    bottom: 40,
    position: 'absolute',
  },
  fullMap: {
    height: '85%',
    width: '100%',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhoto: {
    width: '90%',
    height: '60%',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    alignSelf: 'center',
    marginBottom: 20,
  },
  closePhotoButton: {
    backgroundColor: '#2a3d66',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginBottom: 18,
    elevation: 4,
  },
  banderaFoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    zIndex: 10,
  },
});