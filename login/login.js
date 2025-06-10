import React from "react";
import { auth } from "../firebaseConfig";
import { Button, Text, TextInput, View, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function Login(props) {
    const [mode, setMode] = React.useState("login"); // "login" o "register"
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [password2, setPassword2] = React.useState("");

    const handleSubmit = () => {
        if (mode === "login") {
            console.log("Attempting to sign in");
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User signed in:", user);
                    props.setUser(user);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Error signing in:", errorCode, errorMessage);
                });
        } else if (mode === "register") {
            console.log("Attempting to register");
            if (password !== password2) {
                console.error("Passwords do not match");
                return;
            }
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User registered:", user);
                    props.setUser(user);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Error registering:", errorCode, errorMessage);
                });
        }
    }

    const handleChange = () => {
        if (mode === "login") {
            console.log("Switching to registration");
            setMode("register");
        } else {
            console.log("Switching to login");
            setMode("login");
        }
    }

    let titulo;
    let inputPass2;
    let textoCambiar;
    if (mode === "register") {
        titulo = "Registrarse";
        inputPass2 = (
            <TextInput
                style={styles.input}
                autoCapitalize="none"
                placeholder="Confirmar contraseña"
                value={password2}
                onChangeText={setPassword2}
                secureTextEntry={true}
            />
        );
        textoCambiar = "Iniciar sesión";
    } else {
        titulo = "Iniciar sesión";
        inputPass2 = null;
        textoCambiar = "Registrarse";
    }

    return (
        <View style={styles.form}>
            <Text style={styles.title}>{titulo}</Text>
            <View style={styles.centeredContent}>
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                {inputPass2}
                <View style={styles.button}>
                    <Button style={styles.button} onPress={handleSubmit} title={titulo} />
                </View>
            </View>
            <View style={styles.buttonCambiar}>
                <Button style={styles.button} onPress={handleChange} title={textoCambiar} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        width: '85%',
        height: '75%',
        alignItems: 'center',
        backgroundColor: '#dddddd',
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#222222',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    centeredContent: {
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        alignItems: 'center',
        width: '100%',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        alignContent: 'center',
        padding: 10,
    },
    button: {
        width: '90%',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    buttonCambiar: {
        position: 'absolute',
        bottom: '20%',
        left: 0,
        right: 0,
        alignItems: 'center',
        width: '90%',
    },
});

export default Login;