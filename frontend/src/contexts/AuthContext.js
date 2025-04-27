// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (authToken) {
        try {
          // Verify token and get user data
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/auth/me`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          setCurrentUser(response.data);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [authToken]);

  const login = async (email, password) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      { email, password }
    );
    const { token, user } = response.data;
    
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setCurrentUser(user);
    
    return user;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/register`,
      { name, email, password }
    );
    const { token, user } = response.data;
    
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setCurrentUser(user);
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    authToken,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};