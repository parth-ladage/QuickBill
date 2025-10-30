import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Client = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

interface ClientDashboardProps {
  onShowCreate: () => void;
  onShowEdit: (clientId: string) => void;
  onShowInvoices: (clientId: string, clientName: string) => void; // 1. Add new prop
  refreshKey: number;
  analyticsData: any;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onShowCreate, onShowEdit, onShowInvoices, refreshKey, analyticsData }) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchClients = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/clients?search=${debouncedSearchQuery}`, config);
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      alert('Could not fetch clients.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients, refreshKey]);

  const handleDelete = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/clients/${clientId}`, config);
        fetchClients();
      } catch (error) {
        alert('Failed to delete client.');
      }
    }
  };

  if (loading && clients.length === 0 && !analyticsData) {
    return <Spinner />;
  }

  return (
    <main className='bg-[#eeecff]'>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {analyticsData?.topClients?.length > 0 && (
          <div className="bg-white shadow rounded-lg p-5 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Clients by Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topClients} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clientName" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#8884d8" name="Total Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <button onClick={onShowCreate} className="ml-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6200ee] hover:bg-[#5415ae]">
            + New Client
          </button>
        </div>

        <div className="overflow-auto bg-white rounded-lg shadow max-h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {/* 2. Make the client name a clickable button */}
                    <button onClick={() => onShowInvoices(client._id, client.name)} className="text-indigo-600 hover:underline">
                      {client.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onShowEdit(client._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Update</button>
                    <button onClick={() => handleDelete(client._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && !loading && <p className="text-center py-4 text-gray-500">No clients found.</p>}
        </div>
      </div>
    </main>
  );
};

export default ClientDashboard;