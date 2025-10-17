import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Spinner from '../components/Spinner';

const ProfilePage = () => {
  const { token, setToken } = useAuth();
  const [loading, setLoading] = useState(true);

  // State for profile info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');

  // State for GST settings
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState('0');

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, config);
      const { firstName, lastName, companyName, email, isGstEnabled, gstPercentage } = response.data;
      setFirstName(firstName);
      setLastName(lastName);
      setCompanyName(companyName);
      setEmail(email);
      setIsGstEnabled(isGstEnabled);
      setGstPercentage(gstPercentage.toString());
    } catch (error) {
      alert('Could not fetch your profile data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdateProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const updatedData = { firstName, lastName, companyName, email };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, updatedData, config);
      setToken(response.data.token);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  const handleUpdateTaxSettings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const updatedData = { isGstEnabled, gstPercentage: parseFloat(gstPercentage) || 0 };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, updatedData, config);
      setToken(response.data.token);
      alert('Tax settings updated successfully!');
    } catch (error) {
      alert('Failed to update tax settings.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in both password fields.');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const passwordData = { currentPassword, newPassword };
      await axios.put(`${import.meta.env.VITE_API_URL}/users/change-password`, passwordData, config);
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setToken(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Edit Profile Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleUpdateProfile} className="py-2 px-4 text-white font-semibold rounded-lg shadow-md bg-[#6200ee] hover:bg-[#5415ae]">Save Profile</button>
            </div>
          </div>

          {/* Tax Settings Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tax Settings</h2>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">Enable GST</label>
              <input type="checkbox" checked={isGstEnabled} onChange={() => setIsGstEnabled(!isGstEnabled)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            </div>
            {isGstEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">GST Percentage (%)</label>
                <input type="number" value={gstPercentage} onChange={(e) => setGstPercentage(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={handleUpdateTaxSettings} className="py-2 px-4 text-white font-semibold rounded-lg shadow-md bg-[#6200ee] hover:bg-[#5415ae]">Save Tax Settings</button>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
            <div className="space-y-4">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleChangePassword} className="py-2 px-4 text-white font-semibold rounded-lg shadow-md bg-[#6200ee] hover:bg-[#5415ae]">Update Password</button>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="mt-8 flex justify-end">
            <button onClick={handleLogout} className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Logout</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;