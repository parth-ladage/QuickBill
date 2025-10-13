import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';

// Define the shape of the data and functions the context will provide
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // When the app first loads, check localStorage for a saved token
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setTokenState(storedToken);
    }
    setLoading(false); // Finished loading the initial token
  }, []);

  // Function to set the token and also update localStorage
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  const value = { token, setToken, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};