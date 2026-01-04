import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
} from "firebase/auth";
import { auth } from "../../database/firebase";
import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    // Google Auth
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: WEB_CLIENT_ID,
        responseType: "id_token",
        scopes: ["profile", "email"],
    });

    // Handle Google response
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch(() =>
                setError("Google Sign-In Error")
            );
        }
    }, [response]);

    const login = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
            setError("Incorrect email or password");
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
            setError("Account already exists or weak password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔐 Login</Text>
            <Text style={styles.subtitle}>Access your CyberNews account</Text>

            {error !== "" && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={login}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>
                            Sign In
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={register}
                        style={styles.secondaryButton}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Create Account
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        disabled={!request}
                        onPress={() => promptAsync()}
                        style={styles.googleButton}
                    >
                        <Text style={styles.googleButtonText}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.footerText}>
                By signing in, you agree to our Terms and Privacy Policy
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    errorText: {
        color: '#FF3B30',
        marginBottom: 16,
        textAlign: 'center',
        backgroundColor: '#FF3B30' + '10',
        padding: 12,
        borderRadius: 8,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5EA',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#999',
        fontSize: 14,
    },
    googleButton: {
        backgroundColor: '#DB4437',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 32,
        lineHeight: 18,
    },
});