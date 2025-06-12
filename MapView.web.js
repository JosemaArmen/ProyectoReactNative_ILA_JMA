import React from 'react';
import { View, Text } from 'react-native';

export default function MapView(props) {
  return (
    <View style={[props.style, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
      <Text>Mapa no disponible en web</Text>
      {props.children}
    </View>
  );
}

export const Marker = () => null;


