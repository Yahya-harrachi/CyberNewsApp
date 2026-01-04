import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../database/firebase";
import { useNavigation } from '@react-navigation/native';

export default function CreateAccountScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const validateForm = () => {
        setError("");

        if (!name.trim()) {
            setError("Please enter your name");
            return false;
        }

        if (!email.trim()) {
            setError("Please enter your email");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleCreateAccount = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with name
            await updateProfile(userCredential.user, {
                displayName: name.trim(),
            });

            // Show success message
            Alert.alert(
                "Account Created",
                "Your account has been created successfully!",
                [
                    {
                        text: "Continue",
                        onPress: () => {
                            // The AuthContext will automatically handle the navigation
                        }
                    }
                ]
            );

        } catch (error) {
            console.log(error.code);
            if (error.code === 'auth/email-already-in-use') {
                setError("An account with this email already exists");
            } else if (error.code === 'auth/invalid-email') {
                setError("Invalid email address");
            } else if (error.code === 'auth/weak-password') {
                setError("Password is too weak. Please choose a stronger password.");
            } else if (error.code === 'auth/operation-not-allowed') {
                setError("Account creation is currently disabled");
            } else {
                setError("Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join CyberNews today</Text>
            </View>

            {error !== "" && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
            )}

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        autoCapitalize="words"
                        editable={!loading}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!loading}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Create a password (min. 6 characters)"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        editable={!loading}
                    />
                    <Text style={styles.helperText}>
                        Must be at least 6 characters long
                    </Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        style={styles.input}
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleCreateAccount}
                    style={[styles.createButton, loading && styles.disabledButton]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.createButtonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        By creating an account, you agree to our {' '}
                        <Text style={styles.termsLink}>Terms of Service</Text> and {' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={navigateToLogin}>
                        <Text style={styles.loginLink}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Your data is protected with end-to-end encryption
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 70,
        paddingHorizontal: 24,
        paddingBottom: 30,
        backgroundColor: '#f8f9fa',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: '#007AFF',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        marginHorizontal: 24,
        marginTop: 10,
        marginBottom: 20,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
    },
    form: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 4,
    },
    createButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.6,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    termsContainer: {
        marginBottom: 30,
    },
    termsText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: '#007AFF',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});