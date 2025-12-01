import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { ScaleLoader } from "react-spinners";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '100vh',
          alignItems: 'center',
        }}
      >
        <ScaleLoader
          color="#fff" 
          height={80}
          width={10}
          radius={8}
          margin={5}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
