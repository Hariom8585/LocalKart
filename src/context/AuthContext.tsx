import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../lib/auth';

interface AuthContextType {
  user: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  availableRoles: UserRole[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEMO_USERS.customer);

  useEffect(() => {
    const saved = localStorage.getItem('localkart_auth_role');
    if (saved && (saved in DEMO_USERS)) {
      setUser(DEMO_USERS[saved as UserRole]);
    }
  }, []);

  const switchRole = (role: UserRole) => {
    const selected = DEMO_USERS[role];
    if (selected) {
      setUser(selected);
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
