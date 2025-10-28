import React from 'react';
import Logo from '../assets/logo-white.svg';

interface NavbarProps {
  token: string | null; // Now accepts the user's token
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ token, activeTab, setActiveTab }) => {

  const navItemClasses = (tabName: string) =>
    `px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-[#3e0889] text-white'
        : 'text-indigo-200 hover:bg-[#5415ae] hover:text-white'
    }`;

  return (
    <nav className="bg-[#6200ee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo/Brand Name (always visible) */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('invoices')}> 
            <img src={Logo} alt="QuickBill Logo" className="h-8 w-auto" />
            <span className="font-bold text-white text-xl pl-1">QuickBill</span>
          </div>
          
          {/* Right side: Navigation Links (only visible if logged in) */}
          {token && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <div onClick={() => setActiveTab('invoices')} className={navItemClasses('invoices')}>
                  Invoices
                </div>
                <div onClick={() => setActiveTab('clients')} className={navItemClasses('clients')}>
                  Clients
                </div>
                <div onClick={() => setActiveTab('profile')} className={navItemClasses('profile')}>
                  Profile
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;