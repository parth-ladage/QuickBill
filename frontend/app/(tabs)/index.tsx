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
  TextInput,
  KeyboardAvoidingView, // 1. Import KeyboardAvoidingView
  Platform,             // 2. Import Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart } from "react-native-gifted-charts";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Invoice = {
  _id: string;
  invoiceNumber: string;
  client: { name: string };
  totalAmount: number;
  status: string;
  paymentMethod?: string;
};

const COLORS = {
  paid: '#28a745',
  pending: '#ffc107',
  overdue: '#dc3545',
  draft: '#6c757d',
};

const InvoiceItem = ({ item, onOpenMenu }: { item: Invoice, onOpenMenu: (invoice: Invoice) => void }): React.JSX.Element => {
  const getStatusColor = (status: string): string => COLORS[status as keyof typeof COLORS] || '#6c757d';

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
        {item.status === 'paid' && item.paymentMethod && item.paymentMethod !== '-' && (
            <Text style={styles.paymentMethodText}>via {item.paymentMethod}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => onOpenMenu(item)} style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};


const HomeScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { currentInvoices, paidInvoices } = useMemo<{ currentInvoices: Invoice[]; paidInvoices: Invoice[] }>(() => {
    const current = invoices.filter(inv => inv.status !== 'paid');
    const paid = invoices.filter(inv => inv.status === 'paid');
    return { currentInvoices: current, paidInvoices: paid };
  }, [invoices]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [invoicesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/invoices?search=${debouncedSearchQuery}`, config),
        axios.get(`${API_URL}/analytics/summary`, config),
      ]);
      setInvoices(invoicesRes.data);
      setAnalyticsData(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Could not fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchQuery]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

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
            fetchData();
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

  return (
    // 3. Wrap the entire screen content in KeyboardAvoidingView
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {loading && !analyticsData ? (
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

            <ScrollView
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
            >
              {analyticsData && (
                <View style={styles.analyticsContainer}>
                  <View style={styles.statCardsContainer}>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Total Revenue</Text>
                      <Text style={styles.statValue}>₹{analyticsData.totalRevenue.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Outstanding</Text>
                      <Text style={styles.statValue}>₹{analyticsData.outstandingRevenue.toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Revenue Over Time</Text>
                    <LineChart
                      data={analyticsData.monthlyRevenue.map((item: any) => ({ value: item.revenue, label: item.name }))}
                      height={200}
                      color="#6200ee"
                      thickness={3}
                      dataPointsColor="#6200ee"
                      isAnimated
                    />
                  </View>

                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Invoice Status</Text>
                    <View style={{ alignItems: 'center' }}>
                      <PieChart
                        data={analyticsData.statusBreakdown.map((item: any) => ({
                          value: item.count,
                          color: COLORS[item._id as keyof typeof COLORS] || '#ccc',
                          text: `${item.count}`,
                          label: item._id.charAt(0).toUpperCase() + item._id.slice(1)
                        }))}
                        radius={80}
                        showText
                        textColor="white"
                        textSize={16}
                        showTextBackground
                        textBackgroundColor='rgba(0,0,0,0.5)'
                        focusOnPress
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by invoice # or client..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <Text style={styles.title}>Current Invoices</Text>
              {currentInvoices.length > 0 ? (
                <FlatList
                  data={currentInvoices}
                  renderItem={({ item }) => <InvoiceItem item={item} onOpenMenu={openMenu} />}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              ) : (<Text style={styles.emptyText}>No current invoices found.</Text>)}
              
              <Text style={styles.title}>History</Text>
              {paidInvoices.length > 0 ? (
                <FlatList
                  data={paidInvoices}
                  renderItem={({ item }) => <InvoiceItem item={item} onOpenMenu={openMenu} />}
                  keyExtractor={(item) => `paid-${item._id}`}
                  scrollEnabled={false}
                />
              ) : (<Text style={styles.emptyText}>No paid invoices found.</Text>)}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/createInvoice')}>
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  analyticsContainer: { paddingHorizontal: 16, paddingTop: 16 },
  statCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, elevation: 2, flex: 1, marginHorizontal: 4 },
  statLabel: { fontSize: 14, color: '#6c757d' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 4 },
  chartContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, elevation: 2, marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 16, paddingHorizontal: 10, elevation: 2, marginTop: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 20, color: '#333' },
  itemContainer: { backgroundColor: '#fff', padding: 20, marginVertical: 8, marginHorizontal: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  itemClient: { fontSize: 16, fontWeight: 'bold' },
  itemNumber: { fontSize: 14, color: '#6c757d' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  itemStatus: { fontSize: 14, fontWeight: 'bold' },
  paymentMethodText: { fontSize: 12, color: '#6c757d', fontStyle: 'italic', marginTop: 2 },
  menuButton: { padding: 5 },
  emptyText: { textAlign: 'center', fontSize: 16, color: 'gray', paddingBottom: 20, paddingTop: 10 },
  fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 30, bottom: 30, backgroundColor: '#6200ee', borderRadius: 30, elevation: 8 },
  fabText: { fontSize: 30, color: 'white', lineHeight: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 10, elevation: 10 },
  modalButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  modalButtonText: { marginLeft: 15, fontSize: 18, color: '#333' },
});

export default HomeScreen;