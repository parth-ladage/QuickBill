import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InvoiceDashboard from './pages/InvoiceDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProfilePage from './pages/ProfilePage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import CreateClientPage from './pages/CreateClientPage';
import Spinner from './components/Spinner';
import Navbar from './components/Navbar';

const AppContent = () => {
  const { token, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices');
  
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  
  const [invoiceRefreshKey, setInvoiceRefreshKey] = useState(0);
  const [clientRefreshKey, setClientRefreshKey] = useState(0);

  const triggerInvoiceRefresh = () => setInvoiceRefreshKey(prev => prev + 1);
  const triggerClientRefresh = () => setClientRefreshKey(prev => prev + 1);

  if (loading) {
    return <Spinner />;
  }

  if (token) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="relative">
            {activeTab === 'invoices' && 
              <InvoiceDashboard 
                onShowCreate={() => setShowCreateInvoice(true)} 
                refreshKey={invoiceRefreshKey}
              />
            }
            {activeTab === 'clients' && 
              <ClientDashboard 
                onShowCreate={() => setShowCreateClient(true)}
                refreshKey={clientRefreshKey}
              />
            }
            {activeTab === 'profile' && <ProfilePage />}

            {showCreateInvoice && 
              <CreateInvoicePage 
                onClose={() => setShowCreateInvoice(false)} 
                onSave={() => {
                  setShowCreateInvoice(false);
                  triggerInvoiceRefresh();
                }} 
              />
            }
            {/* This now correctly renders the CreateClientPage component */}
            {showCreateClient &&
              <CreateClientPage
                onClose={() => setShowCreateClient(false)}
                onSave={() => {
                  setShowCreateClient(false);
                  triggerClientRefresh();
                }}
              />
            }
        </div>
      </div>
    );
  }

  if (showRegister) {
    return <RegisterPage onToggle={() => setShowRegister(false)} />;
  }

  return <LoginPage onToggle={() => setShowRegister(true)} />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

