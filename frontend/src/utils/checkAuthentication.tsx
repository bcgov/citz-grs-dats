import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from './jwtParser';
 function useAuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!isTokenValid(token)) {
      navigate('/login');
    }
  }, [navigate]);
}
export default useAuthCheck;
