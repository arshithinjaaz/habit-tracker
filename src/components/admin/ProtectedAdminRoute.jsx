import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../../utils/adminAuth';

const ProtectedAdminRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
