import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CreateClientScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSaveClient = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please enter at least a name and email.');
      return;
    }
    try {
      const clientData = { name, email, phone, address };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/clients`, clientData, config);
      Alert.alert('Success', 'Client created successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create client.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} placeholder="Client's full name" value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="client@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} placeholder="(Optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} placeholder="(Optional)" value={address} onChangeText={setAddress} />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveClient}>
          <Text style={styles.saveButtonText}>Save Client</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#6200ee',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 40,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateClientScreen;