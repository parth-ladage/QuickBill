import React, { useState } from 'react';
import axios from 'axios';

// Define the type for the props, including the onToggle function
interface RegisterPageProps {
  onToggle: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onToggle }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Vite uses import.meta.env instead of process.env
  const API_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Attempting to register...');
    console.log('API URL:', `${API_URL}/users/register`);

    try {
        const userData = { firstName, lastName, companyName, email, password };
        console.log('Sending data:', userData);
        await axios.post(`${API_URL}/users/register`, userData);
        alert('Registration successful! Please log in.');
        onToggle();
    } catch (error: any) {
        // --- IMPROVED ERROR ALERT ---
        // Get the specific error message from the backend, or show a fallback message.
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        alert(errorMessage);
        console.error('Registration error:', error.response ? error.response.data : error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Create your Account
        </h2>
        <form className="space-y-4" onSubmit={handleRegister}>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={onToggle} className="font-medium text-indigo-600 hover:text-indigo-500">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;