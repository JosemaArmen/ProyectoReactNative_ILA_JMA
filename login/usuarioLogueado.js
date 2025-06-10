import { View, Text, StyleSheet } from 'react-native';

function UsuarioLogueado(props) {
    return (
        <View style={styles.form}>
            <Text style={styles.title}>Usuario Logueado</Text>
            <View style={styles.centeredContent}>
                <Text>Bienvenido, {props.user.email}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        width: '85%',
        height: '75%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#dddddd',
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#222222',
    },
    centeredContent: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default UsuarioLogueado;