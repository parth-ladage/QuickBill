import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // 1. Import ActivityIndicator
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 2. Add loading state
  const router = useRouter();
  const { setToken } = useAuth();

  const handleLogin = async () => {
    if (loading) return; // Prevent multiple clicks while loading
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true); // 3. Set loading to true before the API call
    try {
      const userData = {
        email,
        password,
      };

      const response = await axios.post(`${API_URL}/users/login`, userData);

      if (response.status === 200 && response.data.token) {
        setToken(response.data.token);
        router.replace('/(tabs)' as any);
      }
    } catch (error: any) {
      console.error('Login Error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || 'Network error. Please ensure the server is running and the IP address is correct.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false); // 4. Set loading to false after the call completes
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to QuickBill</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* 5. Update the button to show the loading indicator */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        <Link href="/(auth)/register" style={styles.linkText}>
          Don't have an account? Register here
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eeecff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#6200ee',
    fontSize: 16,
  },
});


export default LoginScreen;