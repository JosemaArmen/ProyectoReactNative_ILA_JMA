import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider } from "firebase/auth";
import { Pressable, StyleSheet, Text } from "react-native";
import { app } from "../firebaseConfig";

export default function BtnLoginGoogle() {
    // Initialize Firebase Authentication and get a reference to the service
    const auth = getAuth(app);

    const provider = new GoogleAuthProvider();

    // This will trigger a full page redirect away from your app

    // // After returning from the redirect when your app initializes you can obtain the result
    // const result = await getRedirectResult(auth);
    // if (result) {
    //     // This is the signed-in user
    //     const user = result.user;
    //     // This gives you a Facebook Access Token.
    //     const credential = GoogleAuthProvider.credentialFromResult(result);
    //     // const token = credential.accessToken;
    // }


    return (
        <Pressable
            style={styles.btn}
            onPress={() => {
                console.log('lo intento')
                createUserWithEmailAndPassword(auth, 'johnnycanasta@lalala.com', '123456')
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log(user);
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(errorCode, errorMessage);
                    });

                // signInWithRedirect(auth, provider)
                //     .then(() => {
                //         console.log('redirect');
                //     })
                //     .catch((error) => {
                //         console.log(error);
                //     });
            }}
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