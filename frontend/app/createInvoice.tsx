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
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

type Item = {
  description: string;
  quantity: string;
  rate: string;
};

type Client = {
  _id: string;
  name: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CreateInvoiceScreen = () => {
  const router = useRouter();
  const { token } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalVisible, setClientModalVisible] = useState(false);

  // --- NEW STATE FOR SUGGESTED INVOICE NUMBER ---
  const [suggestedInvoiceNumber, setSuggestedInvoiceNumber] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  
  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: '1', rate: '' },
  ]);
  const [loading, setLoading] = useState(true);

  // Generate a suggested invoice number when the component loads
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    // This is just a visual suggestion. The backend will generate the final sequential number.
    setSuggestedInvoiceNumber(`INV-${year}${month}${day}-001`);
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/clients`, config);
        setClients(response.data);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch clients.');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [token]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    setDueDate(currentDate.toISOString().split('T')[0]);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: '1', rate: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSaveInvoice = async () => {
    if (!selectedClient || !dueDate || items.some(i => !i.description || !i.rate)) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // The invoiceNumber is no longer sent from the frontend
      const invoiceData = {
        client: selectedClient._id,
        dueDate,
        items: items.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity) || 0,
            rate: parseFloat(item.rate) || 0,
        })),
      };

      await axios.post(`${API_URL}/invoices`, invoiceData, config);
      Alert.alert('Success', 'Invoice created successfully!');
      router.back();
    } catch (error) {
        console.error("Save Invoice Error:", error);
        Alert.alert('Error', 'Failed to save the invoice.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClientModalVisible}
        onRequestClose={() => setClientModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Client</Text>
            <FlatList
              data={clients}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clientItem}
                  onPress={() => {
                    setSelectedClient(item);
                    setClientModalVisible(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.container}>
          <Text style={styles.label}>Client</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setClientModalVisible(true)}>
              <Text style={styles.pickerButtonText}>
                {selectedClient ? selectedClient.name : 'Select a client'}
              </Text>
          </TouchableOpacity>

          {/* --- UPDATED INVOICE NUMBER DISPLAY --- */}
          <Text style={styles.label}>Invoice Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={suggestedInvoiceNumber}
            editable={false}
          />

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerButtonText}>{dueDate || 'Select a due date'}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={'date'}
              display="default"
              onChange={onChangeDate}
            />
          )}

          <Text style={styles.subHeader}>Items</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput style={styles.itemInput} placeholder="Description" value={item.description} onChangeText={(val) => handleItemChange(index, 'description', val)} />
              <TextInput style={styles.itemInputQty} placeholder="Qty" value={item.quantity} onChangeText={(val) => handleItemChange(index, 'quantity', val)} keyboardType="numeric" />
              <TextInput style={styles.itemInputRate} placeholder="Rate" value={item.rate} onChangeText={(val) => handleItemChange(index, 'rate', val)} keyboardType="numeric" />
              <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeItemButton}>
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
            <Text style={styles.addItemButtonText}>+ Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveInvoice}>
            <Text style={styles.saveButtonText}>Save Invoice</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
        justifyContent: 'center',
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
    },
    pickerButton: {
      width: '100%',
      height: 50,
      backgroundColor: '#fff',
      borderRadius: 8,
      justifyContent: 'center',
      paddingHorizontal: 15,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    pickerButtonText: {
      fontSize: 16,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    itemInput: {
        flex: 3,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemInputQty: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 8,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemInputRate: {
        flex: 1.5,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 8,
        textAlign: 'right',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    removeItemButton: {
      backgroundColor: '#dc3545',
      borderRadius: 8,
      height: 40,
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addItemButton: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addItemButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#6200ee',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 50,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    clientItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: '#6200ee',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
    }
});

export default CreateInvoiceScreen;

