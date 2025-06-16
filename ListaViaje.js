import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Button } from 'react-native';
import { getDatabase, ref, remove } from 'firebase/database';

const ListaViaje = ({ viajes }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);

  const confirmarEliminar = (viaje) => {
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
      .catch((error) => {
        setModalVisible(false);
        setViajeSeleccionado(null);
        // Maneja el error como prefieras
      });
  };

  return (
    <View>
      {viajes.map((viaje) => (
        <TouchableOpacity
          key={viaje.id}
          onPress={() => confirmarEliminar(viaje)}
        >
          <Text>{viaje.nombre}</Text>
        </TouchableOpacity>
      ))}

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
};

const styles = StyleSheet.create({
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

export default ListaViaje;