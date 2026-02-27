import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />;
};

export default Index;
