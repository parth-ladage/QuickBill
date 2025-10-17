import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from "react-native-gifted-charts";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Client = {
  _id: string;
  name: string;
  email: string;
};

const ClientsScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [clientsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/clients?search=${debouncedSearchQuery}`, config),
        axios.get(`${API_URL}/analytics/summary`, config),
      ]);
      setClients(clientsRes.data);
      setAnalyticsData(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Could not fetch client data.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchQuery]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const openMenu = (client: Client) => {
    setSelectedClient(client);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    if (!selectedClient) return;
    setMenuVisible(false);
    router.push(`/editClient/${selectedClient._id}`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Client', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel', onPress: () => setMenuVisible(false) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!selectedClient || !token) return;
          try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_URL}/clients/${selectedClient._id}`, config);
            setMenuVisible(false);
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete client.');
          }
        },
      },
    ]);
  };

  const handleClientPress = (item: Client) => {
    // FIX: Use a type assertion ('as any') to resolve the TypeScript error
    // This tells TypeScript that we know this dynamic route is valid.
    router.push({
      pathname: `/clientInvoices/${item._id}` as any,
      params: { clientName: item.name },
    });
  };

  const ClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity onPress={() => handleClientPress(item)}>
      <View style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemEmail}>{item.email}</Text>
        </View>
        <TouchableOpacity 
            onPress={(e) => {
                e.stopPropagation();
                openMenu(item);
            }} 
            style={styles.menuButton}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
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
                    <Text style={styles.modalButtonText}>Edit</Text>
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
              {analyticsData?.topClients?.length > 0 && (
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Top Clients by Revenue</Text>
                  <BarChart
                    data={analyticsData.topClients.map((client: any) => ({
                      value: client.totalRevenue,
                      label: client.clientName.substring(0, 8),
                      frontColor: '#6200ee'
                    }))}
                    barWidth={40}
                    isAnimated
                  />
                </View>
              )}

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by client name..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <Text style={styles.title}>All Clients</Text>
              {clients.length > 0 ? (
                <FlatList
                  data={clients}
                  renderItem={({ item }) => <ClientItem item={item} />}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyText}>No clients found.</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/createClient')}>
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
  chartContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, elevation: 2, margin: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 16, paddingHorizontal: 10, elevation: 2, marginTop: 16 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 20, color: '#333' },
  itemContainer: { backgroundColor: '#fff', padding: 20, marginVertical: 8, marginHorizontal: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemEmail: { fontSize: 14, color: '#6c757d' },
  menuButton: { padding: 5 },
  emptyText: { textAlign: 'center', fontSize: 16, color: 'gray', padding: 20 },
  fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 30, bottom: 30, backgroundColor: '#6200ee', borderRadius: 30, elevation: 8 },
  fabText: { fontSize: 30, color: 'white', lineHeight: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 10, elevation: 10 },
  modalButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  modalButtonText: { marginLeft: 15, fontSize: 18, color: '#333' },
});

export default ClientsScreen;
