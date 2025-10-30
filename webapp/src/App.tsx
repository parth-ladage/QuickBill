import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InvoiceDashboard from './pages/InvoiceDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProfilePage from './pages/ProfilePage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import CreateClientPage from './pages/CreateClientPage';
import EditInvoicePage from './pages/EditInvoicePage';
import EditClientPage from './pages/EditClientPage';
import PDFPreviewPage from './pages/PDFPreviewPage';
import ClientInvoicesPage from './pages/ClientInvoicesPage';
import Spinner from './components/Spinner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const AppContent = () => {
  const { token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('invoices');
  
  // State to toggle between login and register pages
  const [showRegister, setShowRegister] = useState(false);

  // State for modals that appear when logged in
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [previewingInvoiceId, setPreviewingInvoiceId] = useState<string | null>(null);
  const [viewingClient, setViewingClient] = useState<{id: string, name: string} | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/summary`, config);
      setAnalyticsData(response.data);
    } catch (error) { console.error('Failed to fetch analytics data:', error); }
  }, [token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics, refreshKey]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Navbar token={token} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="relative flex-grow overflow-y-auto">
        {token ? (
          // --- Logged-In View ---
          <>
            {activeTab === 'invoices' && 
              <InvoiceDashboard 
                onShowCreate={() => setShowCreateInvoice(true)} 
                onShowEdit={(id) => setEditingInvoiceId(id)}
                onShowPreview={(id) => setPreviewingInvoiceId(id)}
                refreshKey={refreshKey}
                analyticsData={analyticsData}
              />
            }
            {activeTab === 'clients' && 
              <ClientDashboard 
                onShowCreate={() => setShowCreateClient(true)}
                onShowEdit={(id) => setEditingClientId(id)}
                onShowInvoices={(id, name) => setViewingClient({id, name})}
                refreshKey={refreshKey}
                analyticsData={analyticsData}
              />
            }
            {/* --- THIS IS THE FIX --- */}
            {/* We now pass the setActiveTab function to the ProfilePage */}
            {activeTab === 'profile' && <ProfilePage setActiveTab={setActiveTab} />}
          </>
        ) : (
          // --- Logged-Out View ---
          <>
            {showRegister ? (
              <RegisterPage onToggle={() => setShowRegister(false)} />
            ) : (
              <LoginPage onToggle={() => setShowRegister(true)} />
            )}
          </>
        )}
      </main>
      
      {/* --- Global Modals (Only rendered when logged in) --- */}
      {token && (
        <>
          {showCreateInvoice && <CreateInvoicePage onClose={() => setShowCreateInvoice(false)} onSave={() => { setShowCreateInvoice(false); triggerRefresh(); }} />}
          {showCreateClient && <CreateClientPage onClose={() => setShowCreateClient(false)} onSave={() => { setShowCreateClient(false); triggerRefresh(); }} />}
          {viewingClient && 
              <ClientInvoicesPage 
                clientId={viewingClient.id} 
                clientName={viewingClient.name} 
                onClose={() => setViewingClient(null)} 
                onShowEdit={(id) => setEditingInvoiceId(id)}
                onShowPreview={(id) => setPreviewingInvoiceId(id)}
              />
          }
          {editingInvoiceId && <EditInvoicePage invoiceId={editingInvoiceId} onClose={() => setEditingInvoiceId(null)} onSave={() => { setEditingInvoiceId(null); triggerRefresh(); }} />}
          {editingClientId && <EditClientPage clientId={editingClientId} onClose={() => setEditingClientId(null)} onSave={() => { setEditingClientId(null); triggerRefresh(); }} />}
          {previewingInvoiceId && <PDFPreviewPage invoiceId={previewingInvoiceId} onClose={() => setPreviewingInvoiceId(null)} />}
        </>
      )}
      
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

