import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PDFPreviewScreen = () => {
  const { invoiceId } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();

  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  const handleShareOrSave = async () => {
    if (!html) return;
    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Uh oh", "Sharing isn't available on your platform");
        return;
      }

      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share or Save Invoice' });
    } catch (error) {
      Alert.alert('Error', 'Could not process the PDF.');
    }
  };

  useEffect(() => {
    if (!invoiceId || !token) {
      setLoading(false);
      return;
    }
    const fetchInvoiceHtml = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/invoices/${invoiceId}/html`, config);
        setHtml(data.html);
      } catch (error) {
        Alert.alert('Error', 'Could not load invoice preview.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceHtml();
  }, [invoiceId, token]);

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
      />
      <View style={styles.buttonContainer}>
        {/* Simplified to a single button */}
        <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShareOrSave}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>Share / Save PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default PDFPreviewScreen;