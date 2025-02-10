import React, { createContext, useContext, useState, useEffect } from 'react';
import Api, { API_BASE } from '../api/API';

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await Api.instance.get(`${API_BASE}/general/user`, { withCredentials: true });

                if (response.data && response.data.username) {
                    setUser(response.data); // Set authenticated user
                } else {
                    setUser(null); // No valid user data returned
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    console.warn('User is not authenticated.');
                } else {
                    console.error('Error fetching user data:', error);
                }
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await Api.instance.post(`${API_BASE}/general/user/logout`, {}, { withCredentials: true });
            setUser(null);
            localStorage.removeItem('auth_token'); // Clear any stored auth tokens
            window.location.href = "/"; // Redirect to homepage after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
            {!isLoading && children} {/* Prevent rendering UI until authentication is checked */}
        </AuthContext.Provider>
    );
};
