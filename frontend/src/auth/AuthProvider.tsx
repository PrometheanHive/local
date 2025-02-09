import React, { createContext, useContext, useState, useEffect } from 'react';
import Api, { API_BASE } from '../api/API';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
            }
            setIsLoading(false);
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
