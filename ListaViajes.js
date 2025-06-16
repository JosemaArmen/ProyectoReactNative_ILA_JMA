import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Button } from 'react-native';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
// import app from './firebaseConfig';
import { db } from './firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ListaViajes({ navigation }) {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);

  useEffect(() => {
    // const db = getDatabase(app);
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

  const handleLongPress = (viaje) => {
    setViajeSeleccionado(viaje);
    setModalVisible(true);
  };

  const eliminarViaje = () => {
    const db = getDatabase();
    remove(ref(db, `viajes/${viajeSeleccionado.id}`))
      .then(() => {
        setModalVisible(false);
        setViajeSeleccionado(null);
        // Aquí puedes actualizar la lista de viajes si lo necesitas
      })
      .catch(() => {
        setModalVisible(false);
        setViajeSeleccionado(null);
      });
  };

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
            navigation.navigate('Account');
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
            onLongPress={() => handleLongPress(item)}
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text>¿Seguro que quieres eliminar este viaje?</Text>
            <View style={styles.buttonRow}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Eliminar" color="red" onPress={eliminarViaje} />
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
});