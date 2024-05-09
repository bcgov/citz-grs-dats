// Callback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthentication } from './services/authService';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthentication().then(() => {
      navigate('/');
    });
  }, [navigate]);

  return <div>Logging you in...</div>;
};

export default Callback;
