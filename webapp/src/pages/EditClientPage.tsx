import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface EditClientPageProps {
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

const EditClientPage: React.FC<EditClientPageProps> = ({ clientId, onClose, onSave }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      if (!token || !clientId) return;
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/clients/${clientId}`, config);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone || '');
        setAddress(data.address || '');
      } catch (error) {
        alert('Failed to fetch client details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId, token]);

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and email are required.');
      return;
    }
    setLoading(true);
    try {
      const clientData = { name, email, phone, address };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/clients/${clientId}`, clientData, config);
      alert('Client updated successfully!');
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to update client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Edit Client</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleUpdateClient} className="p-6 space-y-4 bg-[#eeecff]">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </form>
        )}
        <div className="p-6 bg-gray-50 border-t flex justify-end">
          <button type="button" onClick={onClose} className="mr-3 py-2 px-4 border border-gray-300 rounded-md text-sm">Cancel</button>
          <button type="submit" onClick={handleUpdateClient} disabled={loading} className="py-2 px-4 bg-indigo-600 text-white rounded-md disabled:opacity-50">
            {loading ? 'Saving...' : 'Update Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClientPage;