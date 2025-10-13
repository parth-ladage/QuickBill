import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

// Define the type for an invoice object
type Invoice = {
  _id: string;
  invoiceNumber: string;
  client: { name: string };
  totalAmount: number;
  status: string;
  dueDate: string;
};

// Define the props that this component will receive
interface InvoiceDashboardProps {
  onShowCreate: () => void;
  refreshKey: number;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ onShowCreate, refreshKey }) => {
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
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices?search=${debouncedSearchQuery}`, config);
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      alert('Could not fetch invoices.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, refreshKey]);

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`, config);
        fetchInvoices();
      } catch (error) {
        alert('Failed to delete invoice.');
      }
    }
  };
  
  const { currentInvoices, paidInvoices } = useMemo(() => {
    const current = invoices.filter(inv => inv.status !== 'paid');
    const paid = invoices.filter(inv => inv.status === 'paid');
    return { currentInvoices: current, paidInvoices: paid };
  }, [invoices]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const InvoiceTable = ({ title, data }: { title: string, data: Invoice[] }) => (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{title}</h3>
      {/* This container will now scroll if the content overflows */}
      <div className="overflow-auto bg-white rounded-lg shadow max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((invoice) => (
              <tr key={invoice._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{invoice.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => alert('Edit ' + invoice._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(invoice._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center py-4 text-gray-500">No invoices found.</p>}
      </div>
    </div>
  );

  if (loading && invoices.length === 0) {
    return <Spinner />;
  }

  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by invoice # or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <button onClick={onShowCreate} className="ml-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            + New Invoice
          </button>
        </div>

        <div className="space-y-8">
          <InvoiceTable title="Current Invoices" data={currentInvoices} />
          <InvoiceTable title="History (Paid Invoices)" data={paidInvoices} />
        </div>
      </div>
    </main>
  );
};

export default InvoiceDashboard;