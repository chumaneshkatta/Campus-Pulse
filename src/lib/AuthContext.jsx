import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();
const ADMIN_EMAIL = 'sidharthareddy@gmail.com';

const isAllowedUser = (candidate) => {
  const email = candidate?.email?.trim().toLowerCase();
  if (email === ADMIN_EMAIL) return true;
  return /^(23|24|25|26)[a-z]{2}\d{3}[a-z]\d{2}@anurag\.edu\.in$/i.test(email || '');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    const storedDemoUser = (() => {
      try {
        const value = window.localStorage.getItem('demoUser');
        const candidate = value ? JSON.parse(value) : null;
        if (candidate && !isAllowedUser(candidate)) window.localStorage.removeItem('demoUser');
        return isAllowedUser(candidate) ? candidate : null;
      } catch (error) {
        return null;
      }
    })();

    if (!appParams.appId) {
      if (storedDemoUser) {
        setUser(storedDemoUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      setAuthChecked(true);
      return;
    }

    checkAppState();
  }, []);

  const login = (userData) => {
    const safeUser = userData || { id: 'local-demo-user', full_name: 'Demo Athlete', email: 'demo@unisport.local' };

    if (!appParams.appId) {
      window.localStorage.setItem('demoUser', JSON.stringify(safeUser));
    }

    setUser(safeUser);
    setIsAuthenticated(true);
    setAuthError(null);
    setAuthChecked(true);
  };

  const checkAppState = async () => {
    // The exported project can be previewed locally without Base44 credentials.
    // Use a clearly local-only demo session so protected navigation still works.
    if (!appParams.appId) {
      const storedDemoUser = (() => {
        try {
          const value = window.localStorage.getItem('demoUser');
          const candidate = value ? JSON.parse(value) : null;
          if (candidate && !isAllowedUser(candidate)) window.localStorage.removeItem('demoUser');
          return isAllowedUser(candidate) ? candidate : null;
        } catch (error) {
          return null;
        }
      })();

      if (storedDemoUser) {
        setUser(storedDemoUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      setAuthChecked(true);
      return;
    }

    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    setAuthChecked(true);

    try {
      window.localStorage.removeItem('demoUser');
    } catch (error) {
      // no-op in private browsing or restricted environments
    }

    try {
      if (typeof window !== 'undefined') {
        const tokenKeys = ['base44_access_token', 'access_token', 'token'];
        tokenKeys.forEach((key) => window.localStorage.removeItem(key));
      }
    } catch (error) {
      // no-op in restricted browser environments
    }

    if (shouldRedirect) {
      window.location.assign('/login');
    }
  };

  const navigateToLogin = () => {
    if (!appParams.appId) {
      window.location.assign('/login');
      return;
    }

    try {
      base44.auth.redirectToLogin(window.location.href);
    } catch (error) {
      window.location.assign('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      login,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
