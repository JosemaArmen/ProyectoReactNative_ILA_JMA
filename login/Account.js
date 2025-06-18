import { View, TouchableOpacity, Text } from 'react-native';
import { auth } from '../firebaseConfig'
import { connect } from 'react-redux';
import { addUser, setLoggedIn } from '../redux/ActionCreators';

const mapDispatchToProps = dispatch => ({
    addUser: (user) => dispatch(addUser(user)),
    setLoggedIn: (loggedIn) => dispatch(setLoggedIn(loggedIn))
});

function Account({ navigation, addUser, setLoggedIn }) {

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                console.log("User signed out successfully");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
        addUser(null);
        setLoggedIn(false);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPress={handleLogout}
            >
                <Text style={styles.buttonText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
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
        backgroundColor: '#1976d2',
        borderRadius: 25,
        paddingVertical: 16,
        paddingHorizontal: 48,
        alignItems: 'center',
        width: 260,
        marginTop: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
};

export default connect(null, mapDispatchToProps)(Account);