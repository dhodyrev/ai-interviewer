import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import TemplateList from './components/templates/TemplateList';
import TemplateCreate from './components/templates/TemplateCreate';
import TemplateEdit from './components/templates/TemplateEdit';
import SessionList from './components/sessions/SessionList';
import SessionDetail from './components/sessions/SessionDetail';
import Interview from './components/interview/Interview';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box maxW="1200px" mx="auto" px={4} py={8}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/templates" element={
                  <ProtectedRoute>
                    <TemplateList />
                  </ProtectedRoute>
                } />

                <Route path="/templates/create" element={
                  <ProtectedRoute>
                    <TemplateCreate />
                  </ProtectedRoute>
                } />

                <Route path="/templates/:id" element={
                  <ProtectedRoute>
                    <TemplateEdit />
                  </ProtectedRoute>
                } />

                <Route path="/sessions" element={
                  <ProtectedRoute>
                    <SessionList />
                  </ProtectedRoute>
                } />

                <Route path="/sessions/:id" element={
                  <ProtectedRoute>
                    <SessionDetail />
                  </ProtectedRoute>
                } />

                <Route path="/interview/:id" element={
                  <ProtectedRoute>
                    <Interview />
                  </ProtectedRoute>
                } />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App; 