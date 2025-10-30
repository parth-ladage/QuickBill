import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Define the type for an invoice object from your API
type Invoice = {
  _id: string;
  invoiceNumber: string;
  client: { name: string };
  totalAmount: number;
  status: string;
  dueDate: string;
  paymentMethod?: string;
  predictedPaymentDate?: string; // This is for the ML prediction
};

// Define the props this component receives from App.tsx
interface InvoiceDashboardProps {
  onShowCreate: () => void;
  onShowEdit: (invoiceId: string) => void;
  onShowPreview: (invoiceId: string) => void;
  refreshKey: number;
  analyticsData: any; // Receives analytics data from App.tsx
}

const COLORS = {
  paid: '#28a745',
  pending: '#ffc107',
  overdue: '#dc3545',
  draft: '#6c757d',
};

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ onShowCreate, onShowEdit, onShowPreview, refreshKey, analyticsData }) => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce effect for search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // This function now correctly *only* fetches the invoice list
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

  // Fetch invoices when the component loads or when refreshKey changes
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, refreshKey]);

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`, config);
        fetchInvoices(); // Refresh the invoice list
      } catch (error) {
        alert('Failed to delete invoice.');
      }
    }
  };
  
  // Memoize the filtered invoice lists
  const { currentInvoices, paidInvoices } = useMemo(() => {
    const current = invoices.filter(inv => inv.status !== 'paid');
    const paid = invoices.filter(inv => inv.status === 'paid');
    return { currentInvoices: current, paidInvoices: paid };
  }, [invoices]);

  // Memoize the pie chart data, based on the analytics prop
  const statusPieData = useMemo(() => {
    return analyticsData?.statusBreakdown.map((item: any) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    })) || [];
  }, [analyticsData]);
  
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Reusable component for rendering the invoice tables
  const InvoiceTable = ({ title, data }: { title: string, data: Invoice[] }) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-auto bg-white rounded-lg shadow max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Est. Payment</th>
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
                  <button onClick={() => onShowEdit(invoice._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Update</button>
                  <button onClick={() => handleDelete(invoice._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data.length === 0 && !loading) && <p className="text-center py-4 text-gray-500">No invoices found for this criteria.</p>}
      </div>
    </div>
  );

  if (loading && !analyticsData) {
    return <Spinner />;
  }

  return (
    <main className='bg-[#eeecff]'>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* --- ANALYTICS SECTION --- */}
        {analyticsData && (
          <div className="mb-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{analyticsData.totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Revenue</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{analyticsData.outstandingRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-5">
              <div className="lg:col-span-3 bg-white shadow rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#6200ee" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:col-span-2 bg-white shadow rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Status</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {statusPieData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* --- INVOICE LIST SECTION --- */}
        <div className="flex justify-between items-center my-6">
          <div className="relative w-full max-w-sm">
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
          <button onClick={onShowCreate} className="ml-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6200ee] hover:bg-[#5415ae]">
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