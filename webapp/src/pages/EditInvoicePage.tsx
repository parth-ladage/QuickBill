import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

interface EditInvoicePageProps {
  invoiceId: string;
  onClose: () => void;
  onSave: () => void;
}

type Item = {
  description: string;
  quantity: string;
  rate: string;
};

const EditInvoicePage: React.FC<EditInvoicePageProps> = ({ invoiceId, onClose, onSave }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  // Form state
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('-');

  const paymentMethodOptions = ['-', 'Online', 'Cash', 'Bank Transfer', 'UPI'];

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!token || !invoiceId) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`, config);
        
        setClientName(data.client.name);
        setInvoiceNumber(data.invoiceNumber);
        setDueDate(data.dueDate.split('T')[0]);
        setItems(data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity.toString(),
          rate: item.rate.toString(),
        })));
        setStatus(data.status);
        setPaymentMethod(data.paymentMethod || '-');
      } catch (error) {
        alert('Failed to fetch invoice details.');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId, token, onClose]);

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

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || items.length === 0 || items.some(i => !i.description || !i.rate)) {
        alert('Please fill all required fields.');
        return;
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const updatedData = {
        dueDate,
        status: status === 'overdue' ? 'pending' : status,
        paymentMethod: status === 'paid' ? paymentMethod : '-',
        items: items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
        })),
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`, updatedData, config);
      alert('Invoice updated successfully!');
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to update invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Edit Invoice</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        {loading ? (
            <div className="flex-grow flex justify-center items-center">
                <Spinner />
            </div>
        ) : (
            <form onSubmit={handleUpdateInvoice} className="p-6 overflow-y-auto bg-[#eeecff]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <input type="text" value={clientName} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice #</label>
                        <input type="text" value={invoiceNumber} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select 
                            value={status} 
                            onChange={(e) => {
                                setStatus(e.target.value);
                                if (e.target.value !== 'paid') {
                                    setPaymentMethod('-');
                                }
                            }} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md"
                        >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            {status === 'overdue' && <option value="overdue" disabled>Overdue</option>}
                        </select>
                    </div>
                    {/* --- CONDITIONAL PAYMENT METHOD --- */}
                    {status === 'paid' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                             <select 
                                value={paymentMethod} 
                                onChange={(e) => setPaymentMethod(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md"
                            >
                                {paymentMethodOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    )}
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
                <button type="button" onClick={handleAddItem} className="mt-2 text-indigo-600 font-medium">+ Add Item</button>

            </form>
        )}
        <div className="p-6 bg-gray-50 border-t flex justify-end mt-auto">
          <button type="button" onClick={onClose} className="mr-3 py-2 px-4 border border-gray-300 rounded-md text-sm">Cancel</button>
          <button type="submit" onClick={handleUpdateInvoice} disabled={loading} className="py-2 px-4 bg-indigo-600 text-white rounded-md disabled:opacity-50">
            {loading ? 'Saving...' : 'Update Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoicePage;