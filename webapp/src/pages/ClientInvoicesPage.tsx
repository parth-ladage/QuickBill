import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

interface ClientInvoicesPageProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
  onShowEdit: (invoiceId: string) => void;
  onShowPreview: (invoiceId: string) => void;
}

// 1. Update the Invoice type to include the new fields
type Invoice = {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  predictedPaymentDate?: string;
  paymentMethod?: string;
};

const ClientInvoicesPage: React.FC<ClientInvoicesPageProps> = ({ clientId, clientName, onClose, onShowEdit, onShowPreview }) => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchInvoices = useCallback(async () => {
    if (!token || !clientId) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices?client=${clientId}&search=${debouncedSearchQuery}`, config);
      setInvoices(response.data);
    } catch (error) {
      alert('Could not fetch invoices for this client.');
    } finally {
      setLoading(false);
    }
  }, [token, clientId, debouncedSearchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`, config);
        fetchInvoices(); // Refresh the list
      } catch (error) {
        alert('Failed to delete invoice.');
      }
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}></div>
      <div className="relative bg-[#eeecff] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Invoices for {clientName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>
        
        <div className="p-6">
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xs pl-4 pr-4 py-2 border border-gray-300 rounded-md"
            />
        </div>

        <div className="px-6 pb-6 overflow-y-auto">
          {loading ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status / Est. Payment</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{invoice.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {/* --- 2. ADDED PREDICTION LOGIC --- */}
                        <div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusClasses(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          {invoice.status === 'paid' && invoice.paymentMethod && invoice.paymentMethod !== '-' ? (
                            <div className="text-xs text-gray-500 mt-1">
                              via {invoice.paymentMethod}
                            </div>
                          ) : (invoice.status === 'pending' || invoice.status === 'overdue') && invoice.predictedPaymentDate ? (
                            <div className="text-xs text-blue-600 mt-1" title="This is a prediction based on your payment history.">
                              Est. Pay Date: {invoice.predictedPaymentDate}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onShowPreview(invoice._id)} className="text-blue-600 hover:text-blue-900 mr-4">Preview</button>
                        <button onClick={() => onShowEdit(invoice._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                        <button onClick={() => handleDelete(invoice._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && <p className="text-center py-4 text-gray-500">No invoices found for this client.</p>}
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t flex justify-end mt-auto">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ClientInvoicesPage;

