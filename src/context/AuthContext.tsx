import { createContext, useContext, useState, useEffect } from 'react';
import { validatePassword, hashPassword } from '../utils/crypto';

interface User {
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORED_USERS_KEY = 'wtr_users';
const CURRENT_USER_KEY = 'wtr_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Try to restore user session
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Get stored users
    const storedUsers = localStorage.getItem(STORED_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : {};

    // For first-time setup, create an admin user
    if (Object.keys(users).length === 0) {
      const adminHash = await hashPassword('admin');
      users.admin = {
        passwordHash: adminHash,
        role: 'admin'
      };
      localStorage.setItem(STORED_USERS_KEY, JSON.stringify(users));
    }

    const userInfo = users[username];
    if (!userInfo) return false;

    const isValid = await validatePassword(password, userInfo.passwordHash);
    if (!isValid) return false;

    const userData: User = {
      username,
      role: userInfo.role
    };

    setUser(userData);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout,
        isAuthenticated: user !== null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}