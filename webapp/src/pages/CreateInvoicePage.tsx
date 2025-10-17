import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface CreateInvoicePageProps {
  onClose: () => void;
  onSave: () => void;
}

type Client = {
  _id: string;
  name: string;
};

type Item = {
  description: string;
  quantity: string;
  rate: string;
};

const CreateInvoicePage: React.FC<CreateInvoicePageProps> = ({ onClose, onSave }) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: '1', rate: '' }]);
  const [loading, setLoading] = useState(false);

  // --- NEW STATE FOR SUGGESTED INVOICE NUMBER ---
  const [suggestedInvoiceNumber, setSuggestedInvoiceNumber] = useState('');

  // Generate a suggested invoice number when the component loads
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    // This is just a visual suggestion. The backend will generate the final sequential number.
    setSuggestedInvoiceNumber(`INV-${year}${month}${day}-001`);
  }, []);


  useEffect(() => {
    // Fetch clients to populate the dropdown
    const fetchClients = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/clients`, config);
        setClients(response.data);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };
    fetchClients();
  }, [token]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: '1', rate: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !dueDate || items.some(i => !i.description || !i.rate)) {
      alert('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const invoiceData = {
        client: selectedClientId,
        dueDate,
        items: items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
        })),
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/invoices`, invoiceData, config);
      alert('Invoice created successfully!');
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">New Invoice</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSaveInvoice} className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>Select a client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {/* --- UPDATED INVOICE NUMBER DISPLAY --- */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                    type="text"
                    value={suggestedInvoiceNumber}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                />
            </div>
          </div>

          <hr className="my-6"/>

          <h4 className="text-lg font-medium mb-4">Items</h4>
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} required className="flex-grow px-3 py-2 border border-gray-300 rounded-md" />
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required className="w-20 px-3 py-2 border border-gray-300 rounded-md" />
              <input type="number" placeholder="Rate" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} required className="w-24 px-3 py-2 border border-gray-300 rounded-md" />
              <button type="button" onClick={() => handleRemoveItem(index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">&times;</button>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium">+ Add Item</button>

        </form>
        <div className="p-6 bg-gray-50 border-t flex justify-end mt-auto">
          <button type="button" onClick={onClose} className="mr-3 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
          <button type="submit" onClick={handleSaveInvoice} disabled={loading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;