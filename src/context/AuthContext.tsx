import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../lib/auth';

interface AuthContextType {
  user: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
  availableRoles: UserRole[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEMO_USERS.customer);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 1. Check if an authenticated user session is saved in localStorage
    const savedUser = localStorage.getItem('localkart_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
          setIsLoggedIn(true);
          return;
        }
      } catch (e) {
        localStorage.removeItem('localkart_user');
      }
    }

    // 2. Otherwise restore the demo persona
    const savedRole = localStorage.getItem('localkart_auth_role');
    if (savedRole && (savedRole in DEMO_USERS)) {
      setUser(DEMO_USERS[savedRole as UserRole]);
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('localkart_user', JSON.stringify(newUser));
    localStorage.setItem('localkart_auth_role', newUser.role);
  };

  const logout = () => {
    localStorage.removeItem('localkart_user');
    setIsLoggedIn(false);
    setUser(DEMO_USERS.customer);
    localStorage.setItem('localkart_auth_role', 'customer');
  };

  const switchRole = (role: UserRole) => {
    const selected = DEMO_USERS[role];
    if (selected) {
      setUser(selected);
      localStorage.removeItem('localkart_user');
      setIsLoggedIn(false);
      localStorage.setItem('localkart_auth_role', role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole: user.role,
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
