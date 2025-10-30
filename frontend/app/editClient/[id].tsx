import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const EditClientScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams(); // Get the client ID from the URL
  
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the existing client's data when the screen loads
  useEffect(() => {
    if (!id || !token) {
        setLoading(false);
        return;
    };
    const fetchClient = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Use the new backend endpoint to get a single client by its ID
        const { data } = await axios.get(`${API_URL}/clients/${id}`, config);
        
        // Pre-populate the form with the fetched data
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone || '');
        setAddress(data.address || '');
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch client details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, token]);

  // Handle the UPDATE action
  const handleUpdateClient = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Name and email are required.');
      return;
    }
    try {
      const clientData = { name, email, phone, address };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Use axios.PUT to update the existing client
      await axios.put(`${API_URL}/clients/${id}`, clientData, config);
      Alert.alert('Success', 'Client updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update client.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
        
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder='(Optional)'/>

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder='(Optional)'/>

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateClient}>
          <Text style={styles.saveButtonText}>Update Client</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#eeecff',
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

export default EditClientScreen;