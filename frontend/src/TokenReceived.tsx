// Callback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthentication, tokenReceived } from './services/authService';

const TokenReceived = () => {
  const navigate = useNavigate();

  useEffect(() => {
    tokenReceived().then(() => {
      navigate('/home');
    });
  }, [navigate]);

  return <div>Logging you in...</div>;
};

export default TokenReceived;
