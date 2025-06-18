import React from "react";
import { auth } from "../firebaseConfig";
import { Button, Text, TextInput, View, StyleSheet, Image, Platform, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { connect } from "react-redux";
import { addUser, setLoggedIn } from "../redux/ActionCreators";

const mapDispatchToProps = dispatch => ({
    addUser: (user) => dispatch(addUser(user)),
    setLoggedIn: (loggedIn) => dispatch(setLoggedIn(loggedIn))
});

function Login({ addUser, setLoggedIn }) {
    const [mode, setMode] = React.useState("login"); // "login" o "register"
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [password2, setPassword2] = React.useState("");
    const [error, setError] = React.useState("");

    const handleSubmit = () => {
        setError("");
        if (mode === "login") {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    addUser({uid: user.uid, expirationTime: user.stsTokenManager.expirationTime});
                    setLoggedIn(true);
                })
                .catch((error) => {
                    setError("Email o contraseña incorrectos.");
                });
        } else if (mode === "register") {
            if (password !== password2) {
                setError("Las contraseñas no coinciden.");
                return;
            }
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    addUser({uid: user.uid, expirationTime: user.stsTokenManager.expirationTime});
                    setLoggedIn(true);
                })
                .catch((error) => {
                    setError("No se pudo registrar el usuario.");
                });
        }
    }

    const handleChange = () => {
        setError("");
        setMode(mode === "login" ? "register" : "login");
    }

    let titulo;
    let inputPass2;
    let textoCambiar;
    if (mode === "register") {
        titulo = "REGISTRARSE";
        inputPass2 = (
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                placeholder="Confirmar contraseña"
                value={password2}
                onChangeText={setPassword2}
                secureTextEntry={true}
                placeholderTextColor="#b0b0b0"
            />
        );
        textoCambiar = "¿Ya tienes cuenta? Inicia sesión";
    } else {
        titulo = "INICIAR SESIÓN";
        inputPass2 = null;
        textoCambiar = "¿No tienes cuenta? Regístrate";
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                    <Image
                        source={require("./phototrip.png")}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                <Text style={styles.title}>{titulo}</Text>
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#b0b0b0"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    placeholderTextColor="#b0b0b0"
                />
                {inputPass2}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>{titulo}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.switchButton} onPress={handleChange}>
                    <Text style={styles.switchButtonText}>{textoCambiar}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        width: 340,
        maxWidth: '90%',
    },
    iconCircle: {
        backgroundColor: '#1976d2',
        borderRadius: 48,
        width: 96,
        height: 96,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        elevation: 4,
    },
    icon: {
        width: 128,
        height: 128
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1976d2',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    },
    input: {
        width: 250,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#1976d2',
        borderRadius: 12,
        backgroundColor: '#f5faff',
        fontSize: 16,
        color: '#222',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    button: {
        backgroundColor: '#1976d2',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 36,
        alignItems: 'center',
        width: 250,
        marginTop: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    switchButton: {
        marginTop: 18,
        alignItems: 'center',
    },
    switchButtonText: {
        color: '#1976d2',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    errorText: {
        color: '#dc3545',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default connect(null, mapDispatchToProps)(Login);