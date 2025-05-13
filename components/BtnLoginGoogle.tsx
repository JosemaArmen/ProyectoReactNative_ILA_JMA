import { Pressable, StyleSheet, Text } from "react-native";

import * as Google from 'expo-auth-session/providers/google';

export default function BtnLoginGoogle() {

    //Configuración de Google
    // Puedes obtener el clientId desde la consola de Google Cloud
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '861130410537-ms812pdt6k6rmp8ij7juel1jua4jvnpv.apps.googleusercontent.com',
        
    });


    return (
        <Pressable style={styles.btn}
            onPress={() => 
                promptAsync().catch((error) => {
                    console.error('Error al iniciar sesión con Google:', error);                
            })}
        >
            <Text style={{ textAlign: 'center' }}>Login con Google</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: '#4285F4',
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
});