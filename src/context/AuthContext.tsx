import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
  availableRoles: UserRole[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');

  useEffect(() => {
    // 1. Check if an authenticated customer user session is saved in localStorage
    const savedUser = localStorage.getItem('localkart_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
          setIsLoggedIn(true);
          setCurrentRole(parsed.role || 'customer');
          return;
        }
      } catch (e) {
        localStorage.removeItem('localkart_user');
      }
    }

    // 2. Otherwise check if a non-customer demo persona was explicitly selected
    const savedRole = localStorage.getItem('localkart_auth_role');
    if (savedRole && savedRole !== 'customer' && (savedRole in DEMO_USERS)) {
      setUser(DEMO_USERS[savedRole as UserRole]);
      setCurrentRole(savedRole as UserRole);
      setIsLoggedIn(true);
    } else {
      // By default: guest customer, unauthenticated
      setUser(null);
      setIsLoggedIn(false);
      setCurrentRole('customer');
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setIsLoggedIn(true);
    setCurrentRole(newUser.role || 'customer');
    localStorage.setItem('localkart_user', JSON.stringify(newUser));
    localStorage.setItem('localkart_auth_role', newUser.role || 'customer');
  };

  const logout = () => {
    localStorage.removeItem('localkart_user');
    localStorage.removeItem('localkart_auth_role');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentRole('customer');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'customer') {
      const savedUser = localStorage.getItem('localkart_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.id) {
            setUser(parsed);
            setIsLoggedIn(true);
            setCurrentRole('customer');
            localStorage.setItem('localkart_auth_role', 'customer');
            return;
          }
        } catch (e) {
          localStorage.removeItem('localkart_user');
        }
      }
      setUser(null);
      setIsLoggedIn(false);
      setCurrentRole('customer');
      localStorage.setItem('localkart_auth_role', 'customer');
    } else {
      const selected = DEMO_USERS[role];
      if (selected) {
        setUser(selected);
        setIsLoggedIn(true);
        setCurrentRole(role);
        localStorage.setItem('localkart_auth_role', role);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        switchRole,
        setUser,
        login,
        logout,
        isLoggedIn,
        availableRoles: ['customer', 'seller', 'delivery_partner', 'admin'],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

