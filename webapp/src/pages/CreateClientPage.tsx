import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface CreateClientPageProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateClientPage: React.FC<CreateClientPageProps> = ({ onClose, onSave }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please enter at least a name and email.');
      return;
    }
    setLoading(true);
    try {
      const clientData = { name, email, phone, address };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/clients`, clientData, config);
      alert('Client created successfully!');
      onSave(); // Trigger a refresh on the client dashboard
      onClose(); // Close the modal
    } catch (error) {
      alert('Failed to create client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* Semi-transparent background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
        onClick={onClose}
      ></div>
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">New Client</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSaveClient} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Client's full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
            <input
              type="tel"
              placeholder="Contact number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
            <input
              type="text"
              placeholder="Client's address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end">
          <button type="button" onClick={onClose} className="mr-3 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
          <button type="submit" onClick={handleSaveClient} disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClientPage;