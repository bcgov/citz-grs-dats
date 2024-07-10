import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
interface UserInfo {
    idir_user_guid:     string;
    sub:                string;
    client_roles:       string[];
    idir_username:      string;
    email_verified:     boolean;
    name:               string;
    preferred_username: string;
    display_name:       string;
    given_name:         string;
    family_name:        string;
    email:              string;
  }
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  home: () => void;
  accessToken: string | null;
  loading: boolean;
    user: UserInfo | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post(`/api/refresh-token`, {}, { withCredentials: true });
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
            setIsAuthenticated(true);
            // Fetch user information
          const userInfo = await axios.get(`/api/userinfo`, {
            headers: {
              Authorization: `Bearer ${response.data.accessToken}`,
            },
          });
          setUser(userInfo.data);
            console.log('User info: ', userInfo);
            console.log('User: ', user?.display_name);
            console.log('Access token refreshed in authContext: ' + accessToken);
            console.log('isAuthenticated in authContext: ' + isAuthenticated);
          } else {
            setIsAuthenticated(false);
          }
      } catch (error) {
        console.error('Failed to refresh token', error);
        setIsAuthenticated(false);
      }
      finally {
        setLoading(false);
      }
    };

    fetchAccessToken();
  }, []);

  const login = () => {
    window.location.href = `/api/login?returnUrl=${encodeURIComponent(window.location.href)}`;
  };

  const home = () => {
    window.location.href = `/dashboard`;
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    window.location.href = `/api/logout`
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user,login, logout, accessToken, loading, home }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
