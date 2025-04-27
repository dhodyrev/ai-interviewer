// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TemplateList from './components/templates/TemplateList';
import TemplateForm from './components/templates/TemplateForm';
import InterviewList from './components/interviews/InterviewList';
import ChatInterface from './components/interview/ChatInterface';
import InterviewAnalysisDashboard from './components/analysis/InterviewAnalysisDashboard';
import ThankYou from './pages/ThankYou';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/interviews/join/:id" element={<ChatInterface />} />
            <Route path="/interviews/:id/thank-you" element={<ThankYou />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/templates" element={
              <ProtectedRoute>
                <Navbar />
                <TemplateList />
              </ProtectedRoute>
            } />
            
            <Route path="/templates/new" element={
              <ProtectedRoute>
                <Navbar />
                <TemplateForm />
              </ProtectedRoute>
            } />
            
            <Route path="/templates/edit/:id" element={
              <ProtectedRoute>
                <Navbar />
                <TemplateForm />
              </ProtectedRoute>
            } />
            
            <Route path="/templates/:templateId/interviews" element={
              <ProtectedRoute>
                <Navbar />
                <InterviewList />
              </ProtectedRoute>
            } />
            
            <Route path="/interviews/:id/analysis" element={
              <ProtectedRoute>
                <Navbar />
                <InterviewAnalysisDashboard />
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;