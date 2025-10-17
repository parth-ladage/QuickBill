import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect, Stack, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Invoice = {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
};

const COLORS = {
  paid: '#28a745',
  pending: '#ffc107',
  overdue: '#dc3545',
  draft: '#6c757d',
};

const ClientInvoicesScreen = () => {
  const { id, clientName } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // State for action menu
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchInvoices = useCallback(async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Pass both client ID and search query to the API
      const response = await axios.get(`${API_URL}/invoices?client=${id}&search=${debouncedSearchQuery}`, config);
      setInvoices(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch invoices for this client.');
    } finally {
      setLoading(false);
    }
  }, [token, id, debouncedSearchQuery]);

  useFocusEffect(useCallback(() => { fetchInvoices(); }, [fetchInvoices]));

  const openMenu = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setMenuVisible(true);
  };
  
  const handleEdit = () => {
    if (!selectedInvoice) return;
    setMenuVisible(false);
    router.push(`/editInvoice/${selectedInvoice._id}`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Invoice', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel', onPress: () => setMenuVisible(false) },
      { text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (!selectedInvoice || !token) return;
          try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_URL}/invoices/${selectedInvoice._id}`, config);
            setMenuVisible(false);
            fetchInvoices();
          } catch (error) { Alert.alert('Error', 'Failed to delete invoice.'); }
        },
      },
    ]);
  };
  
  const handlePreview = () => {
    if (!selectedInvoice) return;
    setMenuVisible(false);
    router.push({ pathname: '/pdfPreview', params: { invoiceId: selectedInvoice._id } });
  };


  const InvoiceItem = ({ item }: { item: Invoice }) => {
      const getStatusColor = (status: string): string => COLORS[status as keyof typeof COLORS] || '#6c757d';

      return (
          <View style={styles.itemContainer}>
              <View style={{ flex: 1 }}>
                  <Text style={styles.itemNumber}>{item.invoiceNumber}</Text>
                  <Text style={{ ...styles.itemStatus, color: getStatusColor(item.status) }}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
              </View>
              <Text style={styles.itemAmount}>₹{item.totalAmount.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => openMenu(item)} style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="#333" />
              </TouchableOpacity>
          </View>
      );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Invoices for ${clientName}` }} />
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={20} color="#333" />
              <Text style={styles.modalButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handlePreview}>
              <Ionicons name="eye" size={20} color="#007bff" />
              <Text style={[styles.modalButtonText, { color: '#007bff' }]}>Preview PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#dc3545" />
              <Text style={[styles.modalButtonText, { color: '#dc3545' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading && invoices.length === 0 ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.centered} />
      ) : (
        <FlatList
          data={invoices}
          renderItem={({ item }) => <InvoiceItem item={item} />}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by invoice number..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No invoices found for this client.</Text>}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchInvoices} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    margin: 16, 
    paddingHorizontal: 10, 
    elevation: 2 
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    height: 45, 
    fontSize: 16 
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  itemNumber: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#333',
  },
  itemStatus: { 
    fontSize: 14, 
    textTransform: 'capitalize',
    marginTop: 4,
  },
  itemAmount: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    paddingLeft: 15,
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16, 
    color: 'gray' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 10, 
    elevation: 10 
  },
  modalButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15 
  },
  modalButtonText: { 
    marginLeft: 15, 
    fontSize: 18, 
    color: '#333' 
  },
});

export default ClientInvoicesScreen;