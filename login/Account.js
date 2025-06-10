import { Button, View } from 'react-native';
import { auth } from '../firebaseConfig'

function Account({ navigation, setUser }) {

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                console.log("User signed out successfully");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
        setUser(null); // Limpiar el estado del usuario
        // navigation.navigate('Home'); // Redirigir a la pantalla de inicio de sesión
    }

    return (
        <View style={styles.container}>
            <Button
                title="Cerrar sesión"
                onPress={handleLogout}
            >
            </Button>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    button: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
};

export default Account;