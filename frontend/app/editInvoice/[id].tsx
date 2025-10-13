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
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

type Item = {
  description: string;
  quantity: string;
  rate: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const EditInvoiceScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);

  // Form state
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isStatusModalVisible, setStatusModalVisible] = useState(false);
  // User can only set these statuses. "Overdue" is calculated automatically.
  const statusOptions = ['draft', 'pending', 'paid'];

  useEffect(() => {
    if (!id || !token) {
        setLoading(false);
        return;
    };
    const fetchInvoice = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/invoices/${id}`, config);
        
        setClientName(data.client.name);
        setInvoiceNumber(data.invoiceNumber);
        const formattedDate = data.dueDate.split('T')[0];
        setDueDate(formattedDate);
        setDate(new Date(formattedDate));
        setItems(data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity.toString(),
          rate: item.rate.toString(),
        })));
        setStatus(data.status);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch invoice details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, token]);
  
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

  const handleUpdateInvoice = async () => {
    if (!invoiceNumber || !dueDate || items.length === 0 || items.some(i => !i.description || !i.rate || !i.quantity)) {
        Alert.alert('Error', 'Please fill all required fields.');
        return;
    }
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const updatedData = {
            invoiceNumber,
            dueDate,
            // If the status is 'overdue', we save it as 'pending' because 'overdue' is a calculated state.
            status: status === 'overdue' ? 'pending' : status,
            items: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity) || 0,
                rate: parseFloat(item.rate) || 0,
            }))
        };
        await axios.put(`${API_URL}/invoices/${id}`, updatedData, config);
        Alert.alert('Success', 'Invoice updated successfully!');
        router.back();
    } catch (error) {
        Alert.alert('Error', 'Failed to update invoice.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
      {/* Status Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isStatusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setStatusModalVisible(false)}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Status</Text>
                {statusOptions.map((option) => (
                <TouchableOpacity
                    key={option}
                    style={styles.modalItem}
                    onPress={() => {
                    setStatus(option);
                    setStatusModalVisible(false);
                    }}
                >
                    <Text style={styles.modalItemText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
                </TouchableOpacity>
                ))}
            </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.container}>
          <Text style={styles.label}>Client</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={clientName} editable={false} />

          <Text style={styles.label}>Invoice Number</Text>
          <TextInput style={styles.input} value={invoiceNumber} onChangeText={setInvoiceNumber} />
          
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{dueDate || 'Select a due date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={date} mode={'date'} display="default" onChange={onChangeDate} />
          )}

          <Text style={styles.label}>Status</Text>
          <TouchableOpacity style={styles.input} onPress={() => setStatusModalVisible(true)}>
            <Text style={{textTransform: 'capitalize'}}>{status || 'Select a status'}</Text>
          </TouchableOpacity>

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

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateInvoice}>
            <Text style={styles.saveButtonText}>Update Invoice</Text>
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
        justifyContent: 'center',
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
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
    // Modal Styles
    modalOverlay: {
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
    modalItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    modalItemText: {
      textAlign: 'center',
      fontSize: 18,
    }
});

export default EditInvoiceScreen;