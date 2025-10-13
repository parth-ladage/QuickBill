import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItemClasses = (tabName: string) =>
    `px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
      activeTab === tabName
        ? 'bg-indigo-700 text-white'
        : 'text-gray-300 hover:bg-indigo-500 hover:text-white'
    }`;

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo/Brand Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="font-bold text-white text-xl">QuickBill</span>
            </div>
          </div>
          {/* Right side: Navigation Links */}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;