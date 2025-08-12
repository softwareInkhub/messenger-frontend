import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Show login page when user is not authenticated
  if (!user) {
    console.log('No user found, showing login page');
    return <LoginPage />;
  }

  console.log('User authenticated, showing protected content');

  return <>{children}</>;
};

export default ProtectedRoute;


