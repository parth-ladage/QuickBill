import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  // Image, // Commented out for now
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker'; // Commented out for now

// IMPORTANT: To use the image upload feature, you need to get a free API key from Imgur.
// const IMGUR_CLIENT_ID = 'YOUR_IMGUR_CLIENT_ID'; // Commented out for now

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ProfileScreen = () => {
  const router = useRouter();
  const { token, setToken } = useAuth();
  const [loading, setLoading] = useState(true);
  // const [isUploading, setIsUploading] = useState(false); // Commented out for now

  // Profile info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  // const [logoUrl, setLogoUrl] = useState(''); // Commented out for now
  
  // const [localImageUri, setLocalImageUri] = useState<string | null>(null); // Commented out for now

  // GST state
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState('0');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        if (!token) { setLoading(false); return; }
        try {
          setLoading(true);
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${API_URL}/users/profile`, config);
          const { firstName, lastName, companyName, email, isGstEnabled, gstPercentage /*, logoUrl */ } = response.data;
          setFirstName(firstName);
          setLastName(lastName);
          setCompanyName(companyName);
          setEmail(email);
          setIsGstEnabled(isGstEnabled);
          setGstPercentage(gstPercentage.toString());
          // setLogoUrl(logoUrl || ''); // Commented out for now
        } catch (error) {
          Alert.alert('Error', 'Could not fetch your profile data.');
        } finally {
          setLoading(false);
        }
      };
      fetchUserProfile();
    }, [token])
  );

  /*
  // --- IMAGE UPLOAD FUNCTIONALITY (COMMENTED OUT) ---
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant permission to access your photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (IMGUR_CLIENT_ID === 'YOUR_IMGUR_CLIENT_ID') {
        Alert.alert('Setup Required', 'Please add your Imgur Client ID to the profile.tsx file to enable uploads.');
        return null;
    }
    setIsUploading(true);
    try {
        const formData = new FormData();
        const fileInfo = {
            uri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        } as any;

        formData.append('image', fileInfo);

        const response = await axios.post('https://api.imgur.com/3/image', formData, {
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data.link;
    } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Error', 'Failed to upload image.');
        return null;
    } finally {
        setIsUploading(false);
    }
  };
  */

  const handleUpdateProfile = async () => {
    /*
    // --- IMAGE UPLOAD LOGIC (COMMENTED OUT) ---
    let finalLogoUrl = logoUrl;

    if (localImageUri) {
        const uploadedUrl = await uploadImage(localImageUri);
        if (uploadedUrl) {
            finalLogoUrl = uploadedUrl;
            setLogoUrl(uploadedUrl);
            setLocalImageUri(null);
        } else {
            return;
        }
    }
    */

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const updatedData = { 
            firstName, 
            lastName, 
            companyName, 
            email,
            // logoUrl: finalLogoUrl, // Commented out for now
        };
        const response = await axios.put(`${API_URL}/users/profile`, updatedData, config);

        setToken(response.data.token);
        Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
        Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleUpdateTaxSettings = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const updatedData = { 
            isGstEnabled,
            gstPercentage: parseFloat(gstPercentage) || 0,
        };
        const response = await axios.put(`${API_URL}/users/profile`, updatedData, config);

        setToken(response.data.token);
        Alert.alert('Success', 'Tax settings updated successfully!');
    } catch (error) {
        Alert.alert('Error', 'Failed to update tax settings.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
        Alert.alert('Error', 'Please fill in both password fields.');
        return;
    }
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const passwordData = { currentPassword, newPassword };
        await axios.put(`${API_URL}/users/change-password`, passwordData, config);
        Alert.alert('Success', 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to change password.';
        Alert.alert('Error', errorMessage);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => {
          setToken(null);
          router.replace('/(auth)');
      }}
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Edit Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>

        {/*
        // --- COMPANY LOGO SECTION (COMMENTED OUT) ---
        <Text style={styles.label}>Company Logo</Text>
        <Image 
            source={{ uri: localImageUri || logoUrl || 'https://via.placeholder.com/100' }} 
            style={styles.logoPreview} 
        />
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
            <Text style={styles.buttonText}>Change Logo</Text>
        </TouchableOpacity>
        */}
        
        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
        
        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Company Name</Text>
        <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />
        
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
        
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} /*disabled={isUploading}*/>
            {/* {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile</Text>} */}
            <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Tax Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tax Settings</Text>
        <View style={styles.switchContainer}>
            <Text style={styles.label}>Enable GST</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isGstEnabled ? "#6200ee" : "#f4f3f4"}
                onValueChange={() => setIsGstEnabled(previousState => !previousState)}
                value={isGstEnabled}
            />
        </View>
        {isGstEnabled && (
            <>
                <Text style={styles.label}>GST Percentage (%)</Text>
                <TextInput style={styles.input} value={gstPercentage} onChangeText={setGstPercentage} keyboardType="numeric" />
            </>
        )}
        <TouchableOpacity style={styles.button} onPress={handleUpdateTaxSettings}>
            <Text style={styles.buttonText}>Save Tax Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput style={styles.input} placeholder="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#dc3545" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeecff',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  /*
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'center',
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  */
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  /*
  uploadButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  */
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    marginBottom: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#dc3545',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;