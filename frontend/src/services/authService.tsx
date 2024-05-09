// authService.ts
import axios from 'axios';

export const handleAuthentication = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    console.log('code' + code);
    await axios.post('http://localhost:5000/callback', { code });
  }
};

export const tokenReceived = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    if(token) {
        console.log('token' + token);
        localStorage.setItem('access_token', token);
    }
};
