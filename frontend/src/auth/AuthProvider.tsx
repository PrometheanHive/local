import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Api, { API_BASE } from '../api/API';

// Define the AuthContext type
interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_pic?: string;
  is_traveler: boolean;
  is_host: boolean;
}


// Create the AuthContext with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define Props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Api.instance.get(`${API_BASE}/general/user`, { withCredentials: true });

        if (response.data && response.data.username) {
          setUser(response.data); // Correctly sets the user if authenticated
        } else {
          setUser(null); // Ensures guest users get `null`
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null); // Ensures failed requests don't break navigation bar
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
