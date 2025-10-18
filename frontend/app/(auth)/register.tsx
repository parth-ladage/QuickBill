import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView, // 1. Import KeyboardAvoidingView
  Platform,             // 2. Import Platform to detect OS
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !companyName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const userData = {
        firstName,
        lastName,
        companyName,
        email,
        password,
      };

      const response = await axios.post(`${API_URL}/users/register`, userData);

      if (response.status === 201) {
        Alert.alert(
          'Success',
          'Account created successfully! Please log in.'
        );
        router.replace('/');
      }
    } catch (error: any) {
      console.error('Registration Error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    // 3. Wrap everything in KeyboardAvoidingView
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
        />
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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <Link href="/" style={styles.linkText}>
          Already have an account? Login
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eeecff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
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

export default RegisterScreen;