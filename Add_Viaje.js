import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Alert, PermissionsAndroid, Platform, ScrollView } from 'react-native';
import { ref, get, set, push, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firebaseConfig';
import { launchImageLibrary } from 'react-native-image-picker';

const storage = getStorage();

export default function Add_Viaje() {
  const [viajeActualExiste, setViajeActualExiste] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fechas, setFechas] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [ubicacionModalVisible, setUbicacionModalVisible] = useState(false);
  const [ubicacionTexto, setUbicacionTexto] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [fotoModalSeleccionada, setFotoModalSeleccionada] = useState(null);

  // Para edición de ubicación de una foto ya existente
  const [editandoUbicacion, setEditandoUbicacion] = useState(false);
  const [fotoEditandoUbicacion, setFotoEditandoUbicacion] = useState(null);

  // Modal para confirmar la finalización del viaje
  const [finalizarModalVisible, setFinalizarModalVisible] = useState(false);

  // Añade este estado para el modal de cancelar viaje
  const [cancelarModalVisible, setCancelarModalVisible] = useState(false);

  // Cargar fotos al iniciar o cuando se añade una nueva
  const cargarFotos = async () => {
    const fotosRef = ref(db, 'viaje_actual/fotos');
    const snapshot = await get(fotosRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      let fotosArray = [];
      if (Array.isArray(data)) {
        fotosArray = data.filter(Boolean);
      } else if (typeof data === 'object') {
        fotosArray = Object.values(data);
      }
      setFotos(fotosArray);
    } else {
      setFotos([]);
    }
  };

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
          await cargarFotos();
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
          return;
        }
      }
    }
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          setImagenSeleccionada(response.assets[0].uri);
        }
      }
    );
  };

  // Buscar ubicaciones reales con Google Places
  useEffect(() => {
    if (ubicacionTexto.length > 2) {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          ubicacionTexto
        )}&types=geocode&language=es&key=AIzaSyDH0v9dvfBAdnQ657z_3g6_ZtD1_sOxTOc`
      )
        .then((res) => res.json())
        .then((data) => setSugerencias(data.predictions || []))
        .catch(() => setSugerencias([]));
    } else {
      setSugerencias([]);
    }
  }, [ubicacionTexto]);

  // Guardar la foto en el siguiente índice libre del array
  const guardarFotoConUbicacion = async () => {
    if (!imagenSeleccionada || !ubicacionSeleccionada) return;
    setSubiendo(true);
    try {
      let uri = imagenSeleccionada;
      if (!uri.startsWith('file://')) {
        uri = 'file://' + uri;
      }
      const nombreArchivo = `${Date.now()}.jpg`;
      const referencia = storageRef(storage, nombreArchivo);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(referencia, blob);
      const url = await getDownloadURL(referencia);

      const fotosRef = ref(db, 'viaje_actual/fotos');
      const snapshot = await get(fotosRef);
      let fotosArray = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (Array.isArray(data)) {
          fotosArray = data;
        } else if (typeof data === 'object') {
          fotosArray = Object.values(data);
        }
      }
      fotosArray.push({
        url,
        ubicacion: ubicacionSeleccionada.description,
      });
      await set(fotosRef, fotosArray);

      setImagenSeleccionada(null);
      setUbicacionSeleccionada(null);
      setUbicacionModalVisible(false);
      await cargarFotos();
      Alert.alert('Foto añadida correctamente');
    } catch (e) {
      console.log('Error al subir la foto:', e);
      Alert.alert('Error al subir la foto', e.message || '');
    }
    setSubiendo(false);
  };

  // Guardar la nueva ubicación de una foto ya existente
  const guardarNuevaUbicacionFoto = async () => {
    if (!fotoEditandoUbicacion || !ubicacionSeleccionada) return;
    const fotosRef = ref(db, 'viaje_actual/fotos');
    const snapshot = await get(fotosRef);
    let fotosArray = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        fotosArray = data;
      } else if (typeof data === 'object') {
        fotosArray = Object.values(data);
      }
    }
    fotosArray[fotoEditandoUbicacion.idx].ubicacion = ubicacionSeleccionada.description;
    await set(fotosRef, fotosArray);
    await cargarFotos();
    setEditandoUbicacion(false);
    setFotoEditandoUbicacion(null);
    setUbicacionModalVisible(false);
    setUbicacionSeleccionada(null);
    setUbicacionTexto('');
    Alert.alert('Ubicación actualizada');
  };

  // Función para finalizar el viaje
  const finalizarViaje = async () => {
    try {
      const viajeRef = ref(db, 'viaje_actual');
      const snapshot = await get(viajeRef);
      if (snapshot.exists()) {
        const viajeData = snapshot.val();

        // Leer los viajes existentes
        const viajesRef = ref(db, 'viajes');
        const viajesSnap = await get(viajesRef);
        let nextNumber = 1;
        if (viajesSnap.exists()) {
          const viajes = viajesSnap.val();
          // Buscar el siguiente número disponible
          const numeros = Object.keys(viajes).map(Number).filter(n => !isNaN(n));
          if (numeros.length > 0) {
            nextNumber = Math.max(...numeros) + 1;
          }
        }

        // Guardar el viaje con el número como clave
        await set(ref(db, `viajes/${nextNumber}`), viajeData);

        // Eliminar viaje_actual
        await remove(viajeRef);
        setViajeActualExiste(false);
        setMostrarFormulario(false);
        Alert.alert('Viaje finalizado', 'Tu viaje ha sido guardado en la biblioteca de viajes.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo finalizar el viaje.');
    }
    setFinalizarModalVisible(false);
  };

  // Función para cancelar el viaje actual
  const cancelarViaje = async () => {
    try {
      await remove(ref(db, 'viaje_actual'));
      setViajeActualExiste(false);
      setMostrarFormulario(false);
      Alert.alert('Viaje cancelado', 'El viaje actual ha sido eliminado.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cancelar el viaje.');
    }
    setCancelarModalVisible(false);
  };

  const puedeFinalizarViaje =
  !!titulo.trim() &&
  !!fechas.trim() &&
  !!tiempo.trim() &&
  fotos.length > 0;

  if (viajeActualExiste === null) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>Cargando...</Text>;
  }

  if (!viajeActualExiste && !mostrarFormulario) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Empieza una nueva aventura</Text>
        <TouchableOpacity
          onPress={() => {
            // Limpiar todos los campos antes de mostrar el formulario
            setTitulo('');
            setFechas('');
            setTiempo('');
            setImagen(null);
            setFotos([]);
            setMostrarFormulario(true);
          }}
        >
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
      <Text style={styles.tituloAventura}>NUEVA AVENTURA</Text>
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
      {/* Mostrar las fotos guardadas */}
      {fotos.length > 0 && (
        <View style={{ marginTop: 20, width: '100%', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Fotos del viaje:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 120 }}>
            {fotos.map((foto, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setFotoModalSeleccionada({ ...foto, idx });
                }}
              >
                <View style={{ marginRight: 12, alignItems: 'center' }}>
                  <Image source={{ uri: foto.url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                  <Text style={{ fontSize: 12, marginTop: 4, maxWidth: 100 }} numberOfLines={1}>
                    {foto.ubicacion}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <TouchableOpacity style={styles.botonMas} onPress={() => setModalVisible(true)}>
        <Text style={styles.masGrande}>+</Text>
      </TouchableOpacity>
      {/* Modal para añadir foto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setImagenSeleccionada(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>Selecciona una foto de tu galería</Text>
            {imagenSeleccionada && (
              <Image source={{ uri: imagenSeleccionada }} style={{ width: 180, height: 180, marginBottom: 16, borderRadius: 12 }} />
            )}
            <View style={styles.modalButtonsColumn}>
              <TouchableOpacity onPress={pickImage} style={styles.pickImageButtonGrande}>
                <Text style={styles.pickImageButtonTextGrande}>Elegir foto</Text>
              </TouchableOpacity>
              {imagenSeleccionada && (
                <TouchableOpacity
                  onPress={() => {
                    setUbicacionModalVisible(true);
                    setModalVisible(false);
                  }}
                  style={styles.ubicacionButton}
                >
                  <Text style={styles.ubicacionButtonText}>Indicar ubicación</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setImagenSeleccionada(null);
                }}
                style={styles.cancelButtonGrande}
              >
                <Text style={styles.cancelButtonTextGrande}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de ubicación (para añadir o editar) */}
      <Modal
        visible={ubicacionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setUbicacionModalVisible(false);
          setUbicacionSeleccionada(null);
          setUbicacionTexto('');
          setEditandoUbicacion(false);
          setFotoEditandoUbicacion(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 12, fontSize: 18, fontWeight: 'bold' }}>Introduce la ubicación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ciudad, dirección, lugar..."
              value={ubicacionTexto}
              onChangeText={text => {
                setUbicacionTexto(text);
                setUbicacionSeleccionada(null); // Solo se puede aceptar si selecciona una sugerencia
              }}
            />
            {sugerencias.length > 0 && (
              <View style={{ maxHeight: 120, width: 250 }}>
                {sugerencias.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    onPress={() => {
                      setUbicacionSeleccionada(item);
                      setUbicacionTexto(item.description);
                      setSugerencias([]);
                    }}
                    style={{
                      padding: 8,
                      backgroundColor: ubicacionSeleccionada?.place_id === item.place_id ? '#e0e0e0' : '#fff',
                      borderBottomWidth: 1,
                      borderColor: '#ccc',
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setUbicacionModalVisible(false);
                  setUbicacionSeleccionada(null);
                  setUbicacionTexto('');
                  setEditandoUbicacion(false);
                  setFotoEditandoUbicacion(null);
                }}
                style={styles.modalButtonSmall}
              >
                <Text style={styles.modalButtonTextSmall}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={editandoUbicacion ? guardarNuevaUbicacionFoto : guardarFotoConUbicacion}
                style={[
                  styles.modalButtonSmallGreen,
                  { opacity: ubicacionSeleccionada && !subiendo ? 1 : 0.5 }
                ]}
                disabled={!ubicacionSeleccionada || subiendo}
              >
                <Text style={styles.modalButtonTextSmall}>{subiendo ? 'Guardando...' : 'Aceptar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para la foto seleccionada */}
      <Modal
        visible={!!fotoModalSeleccionada}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFotoModalSeleccionada(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {fotoModalSeleccionada && (
              <>
                <Image source={{ uri: fotoModalSeleccionada.url }} style={{ width: 220, height: 220, borderRadius: 12, marginBottom: 16 }} />
                <Text style={{ fontSize: 16, marginBottom: 12 }}>{fotoModalSeleccionada.ubicacion}</Text>
                <TouchableOpacity
                  style={styles.ubicacionButton}
                  onPress={() => {
                    setEditandoUbicacion(true);
                    setFotoEditandoUbicacion(fotoModalSeleccionada);
                    setUbicacionModalVisible(true);
                    setUbicacionTexto('');
                    setUbicacionSeleccionada(null);
                    setFotoModalSeleccionada(null);
                  }}
                >
                  <Text style={styles.ubicacionButtonText}>Cambiar ubicación</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButtonGrande}
                  onPress={async () => {
                    try {
                      const url = fotoModalSeleccionada.url;
                      const nombreArchivo = url.substring(
                        url.lastIndexOf('/') + 1,
                        url.indexOf('?') === -1 ? url.length : url.indexOf('?')
                      );
                      const refStorage = storageRef(storage, nombreArchivo);
                      await deleteObject(refStorage);

                      const fotosRef = ref(db, 'viaje_actual/fotos');
                      const snapshot = await get(fotosRef);
                      let fotosArray = [];
                      if (snapshot.exists()) {
                        const data = snapshot.val();
                        if (Array.isArray(data)) {
                          fotosArray = data;
                        } else if (typeof data === 'object') {
                          fotosArray = Object.values(data);
                        }
                      }
                      fotosArray.splice(fotoModalSeleccionada.idx, 1);
                      await set(fotosRef, fotosArray);
                      await cargarFotos();
                      setFotoModalSeleccionada(null);
                      Alert.alert('Foto eliminada');
                    } catch (e) {
                      Alert.alert('Error al eliminar la foto', e.message || '');
                    }
                  }}
                >
                  <Text style={styles.cancelButtonTextGrande}>Eliminar foto</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Botón FINALIZAR VIAJE */}
      {mostrarFormulario && (
        <>
          <TouchableOpacity
            style={[
              styles.finalizarButton,
              { opacity: puedeFinalizarViaje ? 1 : 0.5 }
            ]}
            onPress={() => {
              if (puedeFinalizarViaje) setFinalizarModalVisible(true);
            }}
            disabled={!puedeFinalizarViaje}
          >
            <Text style={styles.finalizarButtonText}>FINALIZAR VIAJE</Text>
          </TouchableOpacity>
          {/* Botón cancelar viaje */}
          <TouchableOpacity
            style={styles.cancelarViajeButton}
            onPress={() => setCancelarModalVisible(true)}
          >
            <Text style={styles.cancelarViajeButtonText}>CANCELAR VIAJE</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal de confirmación para finalizar viaje */}
      <Modal
        visible={finalizarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFinalizarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              ¿Seguro que quieres finalizar el viaje?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={styles.modalButtonSmall}
                onPress={() => setFinalizarModalVisible(false)}
              >
                <Text style={styles.modalButtonTextSmall}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSmallGreen}
                onPress={finalizarViaje}
              >
                <Text style={styles.modalButtonTextSmall}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para cancelar viaje */}
      <Modal
        visible={cancelarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              ¿Seguro que quieres cancelar y eliminar este viaje?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={styles.modalButtonSmall}
                onPress={() => setCancelarModalVisible(false)}
              >
                <Text style={styles.modalButtonTextSmall}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSmallGreen}
                onPress={cancelarViaje}
              >
                <Text style={styles.modalButtonTextSmall}>Sí, cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  // Nuevo estilo para el título bonito y diferente
  tituloAventura: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1976d2',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 32,
    letterSpacing: 4,
    fontStyle: 'normal',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    textShadowColor: '#90caf9',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  botonMas: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 32,
    right: 16,
    elevation: 4,
  },
  masGrande: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 32,
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  mas: {
    fontSize: 24,
    color: '#fff',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
  },
  modalButtonsColumn: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  pickImageButtonGrande: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  pickImageButtonTextGrande: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ubicacionButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  ubicacionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonGrande: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonTextGrande: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Botones grandes (en columna, ancho completo)
  modalButtonSmall: {
    flex: 1,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 100,
    maxWidth: 140,
  },
  modalButtonSmallGreen: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 100,
    maxWidth: 140,
  },
  modalButtonTextSmall: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalizarButton: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  finalizarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelarViajeButton: {
    position: 'absolute',
    bottom: 40,
    left: 80,
    right: 80,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 2,
  },
  cancelarViajeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
