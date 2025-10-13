import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  TextInput, // Import TextInput for the search bar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Invoice = {
  _id: string;
  invoiceNumber: string;
  client: { name: string };
  totalAmount: number;
  status: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // --- NEW SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce effect to delay search API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  // --------------------------

  const { currentInvoices, paidInvoices } = useMemo(() => {
    const current: Invoice[] = [];
    const paid: Invoice[] = [];
    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        paid.push(inv);
      } else {
        current.push(inv);
      }
    });
    return { currentInvoices: current, paidInvoices: paid };
  }, [invoices]);


  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Append the debounced search query to the API request
      const response = await axios.get(`${API_URL}/invoices?search=${debouncedSearchQuery}`, config);
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      Alert.alert('Error', 'Could not fetch your invoices.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchQuery]); // Re-fetch when the debounced query changes

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices]) // The hook now depends on the debounced search query via fetchInvoices
  );

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
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setMenuVisible(false) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!selectedInvoice || !token) return;
            try {
              const config = { headers: { Authorization: `Bearer ${token}` } };
              await axios.delete(`${API_URL}/invoices/${selectedInvoice._id}`, config);
              setMenuVisible(false);
              fetchInvoices();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete invoice.');
            }
          },
        },
      ]
    );
  };
  
  const handlePreview = () => {
    if (!selectedInvoice) return;
    setMenuVisible(false);
    router.push({
      pathname: '/pdfPreview',
      params: { invoiceId: selectedInvoice._id },
    });
  };

  const InvoiceItem = ({ item }: { item: Invoice }) => {
    const getStatusColor = (status: string) => {
      if (status === 'paid') return '#28a745';
      if (status === 'pending') return '#ffc107';
      if (status === 'overdue') return '#dc3545';
      return '#6c757d';
    };

    return (
      <View style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemClient}>{item.client.name}</Text>
          <Text style={styles.itemNumber}>{item.invoiceNumber}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
          <Text style={styles.itemAmount}>₹{item.totalAmount.toFixed(2)}</Text>
          <Text style={{ ...styles.itemStatus, color: getStatusColor(item.status) }}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => openMenu(item)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && invoices.length === 0 ? (
         <ActivityIndicator size="large" color="#6200ee" style={styles.centered} />
      ) : (
        <>
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
                  <Text style={styles.modalButtonText}>Edit</Text>
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

          {/* --- NEW SEARCH BAR --- */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by invoice # or client name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchInvoices} />
            }
          >
            <Text style={styles.title}>Current Invoices</Text>
            {currentInvoices.length > 0 ? (
              <FlatList
                data={currentInvoices}
                renderItem={({ item }) => <InvoiceItem item={item} />}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyText}>No current invoices found.</Text>
            )}
            
            <Text style={styles.title}>History</Text>
            {paidInvoices.length > 0 ? (
              <FlatList
                data={paidInvoices}
                renderItem={({ item }) => <InvoiceItem item={item} />}
                keyExtractor={(item) => `paid-${item._id}`}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyText}>No paid invoices found.</Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={() => router.push('/createInvoice')}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    color: '#333',
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
  itemClient: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemNumber: {
    fontSize: 14,
    color: '#6c757d',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#6200ee',
    borderRadius: 30,
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  modalButtonText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#333',
  },
});

export default HomeScreen;