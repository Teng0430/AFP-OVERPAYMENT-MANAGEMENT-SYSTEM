import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default ProtectedRoute;
