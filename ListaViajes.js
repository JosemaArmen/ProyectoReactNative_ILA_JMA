import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import app from './firebaseConfig'; // Asegúrate de tener tu configuración de Firebase aquí

export default function ListaViajes() {
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
          ubicacion: item.ubicacion || '',
          foto: item.fotos && Array.isArray(item.fotos) && item.fotos.length > 0 ? item.fotos[0] : null,
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
    <FlatList
      data={viajes}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          {item.foto ? (
            <Image source={{ uri: item.foto }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text>Sin foto</Text>
            </View>
          )}
          <Text style={styles.ubicacion}>{item.ubicacion}</Text>
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
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
  ubicacion: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});