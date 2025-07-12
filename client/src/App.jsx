import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AuthModal from './components/AuthModal';
import pb from './services/pocketbase';

// Protected route component for admin access
const ProtectedAdminRoute = ({ user, children }) => {
  // Check if user is authenticated and is a superuser
  if (!user) {
    console.log('ProtectedAdminRoute: No user authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Debug logging
  console.log('ProtectedAdminRoute Debug Info:');
  console.log('- User object:', user);
  console.log('- pb.authStore.isSuperuser:', pb.authStore.isSuperuser);
  console.log('- pb.authStore.record:', pb.authStore.record);
  console.log('- pb.authStore.model:', pb.authStore.model);
  console.log('- user.collectionName:', user.collectionName);
  console.log('- user.email:', user.email);
  
  // Check if user has superuser privileges
  // For PocketBase superusers, the primary indicator is pb.authStore.isSuperuser
  const isSuperuser = pb.authStore.isSuperuser === true ||
                     pb.authStore.record?.collectionName === '_superusers' ||
                     user.collectionName === '_superusers';
  
  console.log('- Final isSuperuser result:', isSuperuser);
  
  if (!isSuperuser) {
    console.log('ProtectedAdminRoute: User is not a superuser, redirecting to login');
    console.log('- Redirect reason: isSuperuser =', isSuperuser);
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedAdminRoute: Access granted to admin page');
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
    }

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    return () => unsubscribe();
  }, []);

  const handleShowLogin = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute user={user}>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/*"
            element={
              <MainLayout 
                user={user}
                onShowLogin={handleShowLogin}
                onLogout={handleLogout}
              />
            }
          />
        </Routes>
      </AnimatePresence>
      
      {showAuthModal && (
        <AuthModal 
          onClose={handleCloseAuth}
          onSuccess={handleCloseAuth}
        />
      )}
    </>
  );
}

export default App;
