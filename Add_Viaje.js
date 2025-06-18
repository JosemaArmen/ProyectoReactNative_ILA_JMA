import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Alert, PermissionsAndroid, Platform, ScrollView } from 'react-native';
import { ref, get, set, push, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firebaseConfig';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker"; // <-- IMPORTANTE
import { connect } from 'react-redux';
import { storage } from './firebaseConfig';

const mapStateToProps = state => {
  return {
    user: state.user
  };
}

// const storage = getStorage();

function Add_Viaje({ user }) {
  const [viajeActualExiste, setViajeActualExiste] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fechas, setFechas] = useState('');
  // const [tiempo, setTiempo] = useState(''); // Eliminar este estado
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

  // ----------- NUEVO: Estados para el calendario -----------
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('start'); // 'start' o 'end'

  // ----------- NUEVO: Funciones para el calendario -----------
  const handleConfirm = (date) => {
    if (pickerMode === 'start') {
      setFechaInicio(date);
      setShowPicker(false);
      setPickerMode('end');
      setTimeout(() => setShowPicker(true), 400); // Abre el siguiente picker tras cerrar el anterior
    } else {
      setFechaFin(date);
      setShowPicker(false);
      // Actualiza el campo fechas automáticamente
      if (fechaInicio && date) {
        setFechas(`${fechaInicio.toLocaleDateString()} - ${date.toLocaleDateString()}`);
      }
    }
  };

  const showDatePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  // ----------------------------------------------------------

  // Cargar fotos al iniciar o cuando se añade una nueva
  const cargarFotos = async () => {
    const fotosRef = ref(db, 'viaje_actual_' + user.user.uid + '/fotos');
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
        const viajeRef = ref(db, 'viaje_actual_' + user.user.uid);
        const snapshot = await get(viajeRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTitulo(data.nombre || '');
          setFechas(data.fecha || '');
          // setTiempo(data.tiempo || ''); // Eliminar esta línea
          setImagen(data.imagen || null);
          setMostrarFormulario(true);
          setViajeActualExiste(true);
          await cargarFotos();
          // Si hay fechas guardadas, intenta parsearlas
          if (data.fecha && data.fecha.includes('-')) {
            const [ini, fin] = data.fecha.split('-').map(f => f.trim());
            setFechaInicio(new Date(ini.split('/').reverse().join('-')));
            setFechaFin(new Date(fin.split('/').reverse().join('-')));
          }
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
    if (mostrarFormulario && (titulo || fechas || imagen)) {
      set(ref(db, 'viaje_actual_' + user.user.uid), {
        nombre: titulo,
        fecha: fechas,
        // tiempo: tiempo, // Eliminar este campo
        imagen: imagen || null,
        uid: user.user.uid
      });
      setViajeActualExiste(true);
    }
  }, [titulo, fechas, imagen, mostrarFormulario]);

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

  // Función para obtener el clima actual de una ubicación por coordenadas
  const obtenerClimaPorCoordenadas = async (lat, lng) => {
    try {
      const apiKey = 'd748384c6141895207b0f15f56cda724';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&lang=es&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.weather && data.weather.length > 0) {
        return {
          descripcion: data.weather[0].description, // <-- en español
          temp: data.main.temp,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

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

      // Obtener coordenadas de la ubicación seleccionada
      const placeId = ubicacionSeleccionada.place_id;
      let lat = null, lng = null;
      if (placeId) {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyDH0v9dvfBAdnQ657z_3g6_ZtD1_sOxTOc`
        );
        const geoData = await geoRes.json();
        if (geoData.result && geoData.result.geometry && geoData.result.geometry.location) {
          lat = geoData.result.geometry.location.lat;
          lng = geoData.result.geometry.location.lng;
        }
      }

      // Obtener clima actual de esa ubicación
      let climaFoto = null;
      if (lat && lng) {
        climaFoto = await obtenerClimaPorCoordenadas(lat, lng);
      }

      const fotosRef = ref(db, 'viaje_actual_' + user.user.uid + '/fotos');
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

      // Guardar la foto SIN el clima
      fotosArray.push({
        url,
        ubicacion: ubicacionSeleccionada.description,
        // NO guardar clima aquí
      });
      await set(fotosRef, fotosArray);
      // Si es la primera foto, guarda el campo "tiempo" en viaje_actual
      if (fotosArray.length === 1 && climaFoto) {
        let tiempoTexto = '';
        if (climaFoto.descripcion && climaFoto.temp) {
          tiempoTexto = `${climaFoto.descripcion}, ${Math.round(climaFoto.temp)}ºC`;
        } else if (climaFoto.descripcion) {
          tiempoTexto = climaFoto.descripcion;
        } else if (climaFoto.temp) {
          tiempoTexto = `${Math.round(climaFoto.temp)}ºC`;
        } else {
          tiempoTexto = 'Sin datos';
        }
        const viajeActualRef = ref(db, 'viaje_actual_' + user.user.uid);
        await set(viajeActualRef, {
          ...(await (await get(viajeActualRef)).val()),
          tiempo: tiempoTexto,
        });
      }

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
    const fotosRef = ref(db, 'viaje_actual_' + user.user.uid + '/fotos');
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

    // Obtener coordenadas de la nueva ubicación
    const placeId = ubicacionSeleccionada.place_id;
    let lat = null, lng = null;
    if (placeId) {
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyDH0v9dvfBAdnQ657z_3g6_ZtD1_sOxTOc`
      );
      const geoData = await geoRes.json();
      if (geoData.result && geoData.result.geometry && geoData.result.geometry.location) {
        lat = geoData.result.geometry.location.lat;
        lng = geoData.result.geometry.location.lng;
      }
    }

    // Obtener clima de la nueva ubicación
    let climaFoto = null;
    if (lat && lng) {
      climaFoto = await obtenerClimaPorCoordenadas(lat, lng);
    }

    // Actualizar ubicación y clima de la foto
    fotosArray[fotoEditandoUbicacion.idx].ubicacion = ubicacionSeleccionada.description;
    fotosArray[fotoEditandoUbicacion.idx].clima = climaFoto;

    await set(fotosRef, fotosArray);
    await cargarFotos();
    setEditandoUbicacion(false);
    setFotoEditandoUbicacion(null);
    setUbicacionModalVisible(false);
    setUbicacionSeleccionada(null);
    setUbicacionTexto('');
    Alert.alert('Ubicación y clima actualizados');
  };

  // Función para finalizar el viaje
  const finalizarViaje = async () => {
    try {
      const viajeRef = ref(db, 'viaje_actual_' + user.user.uid);
      const snapshot = await get(viajeRef);
      if (snapshot.exists()) {
        const viajeData = snapshot.val();

        // COPIAR el campo "tiempo" tal cual está en viaje_actual
        // (No recalcularlo)
        // viajeData.tiempo ya existe y es el string correcto

        // Leer los viajes existentes
        const viajesRef = ref(db, 'viajes');
        const viajesSnap = await get(viajesRef);
        let nextNumber = 1;
        if (viajesSnap.exists()) {
          const viajes = viajesSnap.val();
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
      await remove(ref(db, 'viaje_actual_' + user.user.uid));
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
    fotos.length > 0;

  // Nuevo estado para el clima
  const [clima, setClima] = useState(null);

  const obtenerClima = async (ubicacion) => {
    try {
      const apiKey = 'd748384c6141895207b0f15f56cda724'; // <-- Pon aquí tu API key de OpenWeatherMap
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ubicacion)}&appid=${apiKey}&lang=es&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.weather && data.weather.length > 0) {
        setClima({
          descripcion: data.weather[0].description,
          temp: data.main.temp,
          icon: data.weather[0].icon,
        });
      } else {
        setClima(null);
      }
    } catch (e) {
      setClima(null);
    }
  };

  if (viajeActualExiste === null) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>Cargando...</Text>;
  }

  if (!viajeActualExiste && !mostrarFormulario) {
    return (
      <View style={styles.nuevaAventuraContainer}>
        <View style={styles.nuevaAventuraCard}>
          <View style={styles.nuevaAventuraIconCircle}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/992/992651.png' }}
              style={styles.nuevaAventuraIcon}
            />
          </View>
          <Text style={styles.nuevaAventuraTitulo}>¡Empieza una nueva aventura!</Text>
          <Text style={styles.nuevaAventuraSubtitulo}>
            Crea un nuevo viaje y guarda tus mejores recuerdos.
          </Text>
          <TouchableOpacity
            style={styles.nuevaAventuraBoton}
            onPress={() => {
              setTitulo('');
              setFechas('');
              setImagen(null);
              setFotos([]);
              setFechaInicio(null);
              setFechaFin(null);
              setMostrarFormulario(true);
            }}
          >
            <Text style={styles.nuevaAventuraBotonTexto}>Crear viaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tituloAventura}>NUEVA AVENTURA</Text>
      {/* Campo Título */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Introduce el título del viaje"
          placeholderTextColor="#b0b0b0"
          value={titulo}
          onChangeText={setTitulo}
        />
      </View>
      {/* Campo Fechas */}
      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.input}
          onPress={() => showDatePicker('start')}
        >
          <Text style={{
            color: fechaInicio ? '#222' : '#b0b0b0',
            fontSize: 16,
          }}>
            {fechaInicio ? `Desde: ${fechaInicio.toLocaleDateString()}` : 'Selecciona fecha de inicio'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.input, { marginTop: 8 }]}
          onPress={() => showDatePicker('end')}
          disabled={!fechaInicio}
        >
          <Text style={{
            color: fechaFin ? '#222' : '#b0b0b0',
            fontSize: 16,
          }}>
            {fechaFin ? `Hasta: ${fechaFin.toLocaleDateString()}` : 'Selecciona fecha de fin'}
          </Text>
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setShowPicker(false)}
        minimumDate={pickerMode === 'end' && fechaInicio ? fechaInicio : undefined}
      />
      {/* Campo Tiempo atmosférico */}
      {/* 
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Tiempo atmosférico (soleado, lluvioso, etc.)"
          placeholderTextColor="#b0b0b0"
          value={tiempo}
          onChangeText={setTiempo}
        />
      </View>
      */}
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
                      obtenerClima(item.description); // <-- Añade esta línea
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

                      const fotosRef = ref(db, 'viaje_actual_' + user.user.uid + '/fotos');
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#1976d2',
    borderRadius: 12,
    backgroundColor: '#f5faff',
    fontSize: 16,
    color: '#222',
    elevation: 2,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    left: 18,
    bottom: -22,
    fontSize: 13,
    color: '#1976d2',
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
  // Nuevos estilos para la pantalla de nueva aventura
  nuevaAventuraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  nuevaAventuraCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: 320,
    maxWidth: '90%',
  },
  nuevaAventuraIconCircle: {
    backgroundColor: '#1976d2',
    borderRadius: 48,
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 4,
  },
  nuevaAventuraIcon: {
    width: 64,
    height: 64,
    tintColor: '#fff',
  },
  nuevaAventuraTitulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  nuevaAventuraSubtitulo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
  },
  nuevaAventuraBoton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    elevation: 2,
  },
  nuevaAventuraBotonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  climaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  climaIcon: {
    width: 40,
    height: 40,
  },
  climaTexto: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default connect(mapStateToProps)(Add_Viaje);