import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Button, Alert, PermissionsAndroid, Platform } from 'react-native';
import { ref, get, set } from 'firebase/database';
import { db } from './firebaseConfig';
import { launchImageLibrary } from 'react-native-image-picker';

export default function Add_Viaje() {
  const [viajeActualExiste, setViajeActualExiste] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fechas, setFechas] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    const checkViajeActual = async () => {
      try {
        const viajeRef = ref(db, 'viaje_actual');
        const snapshot = await get(viajeRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTitulo(data.nombre || '');
          setFechas(data.fecha || '');
          setTiempo(data.tiempo || '');
          setImagen(data.imagen || null);
          setMostrarFormulario(true);
          setViajeActualExiste(true);
        } else {
          setViajeActualExiste(false);
        }
      } catch (error) {
        setViajeActualExiste(false);
      }
    };
    checkViajeActual();
  }, []);

  useEffect(() => {
    if (mostrarFormulario && (titulo || fechas || tiempo || imagen)) {
      set(ref(db, 'viaje_actual'), {
        nombre: titulo,
        fecha: fechas,
        tiempo: tiempo,
        imagen: imagen || null,
      });
      setViajeActualExiste(true);
    }
  }, [titulo, fechas, tiempo, imagen, mostrarFormulario]);

  const pickImage = async () => {
    if (Platform.OS === 'android') {
      let permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      // Para Android 13+ usar el permiso nuevo
      if (Platform.Version >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      }
      const granted = await PermissionsAndroid.check(permission);
      if (!granted) {
        const result = await PermissionsAndroid.request(
          permission,
          {
            title: 'Permiso necesario',
            message: 'Para seleccionar una foto, debes permitir el acceso a la galería.',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Permitir',
          }
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return; // El usuario no dio permiso
        }
      }
    }
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          setImagen(response.assets[0].uri);
          setModalVisible(false);
        }
      }
    );
  };

  if (viajeActualExiste === null) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>Cargando...</Text>;
  }

  if (!viajeActualExiste && !mostrarFormulario) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Empieza una nueva aventura</Text>
        <TouchableOpacity onPress={() => setMostrarFormulario(true)}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/992/992651.png' }}
            style={styles.icon}
          />
          <Text style={styles.mas}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>NUEVA AVENTURA</Text>
      <TextInput
        style={styles.input}
        placeholder="Título del viaje"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Fechas del viaje"
        value={fechas}
        onChangeText={setFechas}
      />
      <TextInput
        style={styles.input}
        placeholder="Tiempo atmosférico"
        value={tiempo}
        onChangeText={setTiempo}
      />
      {imagen && (
        <Image source={{ uri: imagen }} style={{ width: 100, height: 100, marginBottom: 10 }} />
      )}
      <TouchableOpacity style={styles.botonMas} onPress={() => setModalVisible(true)}>
        <Text style={styles.masGrande}>+</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 16 }}>Selecciona una foto de tu galería</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity onPress={pickImage} style={styles.pickImageButton}>
                <Text style={styles.pickImageButtonText}>Elegir foto</Text>
              </TouchableOpacity>
              <View style={{ width: 16 }} />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#2a3d66' },
  icon: { width: 80, height: 80, tintColor: '#2a3d66' },
  mas: { position: 'absolute', right: -10, top: -10, fontSize: 32, color: '#2a3d66', fontWeight: 'bold' },
  input: { width: 250, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 },
  botonMas: { backgroundColor: '#2a3d66', borderRadius: 50, padding: 12, marginTop: 12 },
  masGrande: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 12, alignItems: 'center' },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#e74c3c', // Rojo o el color que prefieras
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickImageButton: {
    backgroundColor: '#2a3d66',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  pickImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});