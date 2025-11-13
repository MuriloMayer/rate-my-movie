import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserLogin, UserRegister } from '../@types/user';
import { storageService } from '../services/storage';
import { validators, errorMessages } from '../utils/validators';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: UserLogin) => Promise<void>;
  signUp: (data: UserRegister) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await storageService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }: UserLogin) => {
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!validators.isValidEmail(email)) {
        throw new Error(errorMessages.EMAIL_INVALID);
      }

      // Buscar usuário
      const foundUser = await storageService.getUserByEmail(email);

      if (!foundUser) {
        throw new Error(errorMessages.USER_NOT_FOUND);
      }

      if (foundUser.password !== password) {
        throw new Error(errorMessages.WRONG_PASSWORD);
      }

      await storageService.setCurrentUser(foundUser);
      setUser(foundUser);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async ({ name, email, password, profileImage }: UserRegister) => {
    try {
      if (!validators.isValidName(name)) {
        throw new Error(errorMessages.NAME_REQUIRED);
      }

      if (!validators.isValidEmail(email)) {
        throw new Error(errorMessages.EMAIL_INVALID);
      }

      if (!validators.isValidPassword(password)) {
        throw new Error(errorMessages.PASSWORD_INVALID);
      }

      const existingUser = await storageService.getUserByEmail(email);
      if (existingUser) {
        throw new Error(errorMessages.EMAIL_ALREADY_EXISTS);
      }

      const newUser: User = {
        id: Date.now().toString(), 
        name,
        email: email.toLowerCase(),
        password,
        profileImage,
        createdAt: new Date().toISOString(),
      };

      await storageService.addUser(newUser);
      
      await storageService.setCurrentUser(newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await storageService.removeCurrentUser();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    try {
      const users = await storageService.getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        await storageService.saveUsers(users);
      }

      await storageService.setCurrentUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};