import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
} from "firebase/auth";
import { auth } from "../../database/firebase";
//import { ThemeContext } from "../../Context/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function LoginScreen() {
    //const { theme, toggleTheme } = useContext(ThemeContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔑 Google Auth (WEB – Expo)
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: WEB_CLIENT_ID,
        responseType: "id_token",
        scopes: ["profile", "email"],
    });

    // 🔁 Handle Google response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch(() =>
                setError("Erreur Google Sign-In")
            );
        }
    }, [response]);

    const login = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
            setError("Email ou mot de passe incorrect");
        } finally {
            setLoading(false);
        }
    };

    const register = async () => {
        setError("");
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (e) {
            setError("Compte déjà existant ou mot de passe faible");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                
                justifyContent: "center",
                padding: 24,
            }}
        >
            <Text
                style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 20,
                    textAlign: "center",
                }}
            >
                Connexion
            </Text>

            {error !== "" && (
                <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                    {error}
                </Text>
            )}

            <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                }}
            />

            <TextInput
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                }}
            />

            {loading ? (
                <ActivityIndicator />
            ) : (
                <>
                    <TouchableOpacity
                        onPress={login}
                        style={{
                            padding: 14,
                            borderRadius: 8,
                            marginBottom: 10,
                        }}
                    >
                        <Text style={{ color: "#fff", textAlign: "center" }}>
                            Se connecter
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={register}
                        style={{
                            borderWidth: 1,
                            padding: 14,
                            borderRadius: 8,
                            marginBottom: 20,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                            }}
                        >
                            Créer un compte
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!request}
                        onPress={() => promptAsync()}
                        style={{
                            backgroundColor: "#DB4437",
                            padding: 14,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: "#fff", textAlign: "center" }}>
                            Continuer avec Google
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            <TouchableOpacity  style={{ marginTop: 30 }}>
                <Text style={{ textAlign: "center"}}>
                    Changer le thème
                </Text>
            </TouchableOpacity>
        </View>
    );
}
