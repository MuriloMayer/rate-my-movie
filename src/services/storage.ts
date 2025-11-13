import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../@types/user';
import { UserMovie } from '../@types/movie';

// Chaves de armazenamento
const STORAGE_KEYS = {
  USERS: '@rate_my_movie:users',
  CURRENT_USER: '@rate_my_movie:current_user',
  USER_MOVIES: '@rate_my_movie:user_movies',
};

export const storageService = {
  
  // Salvar todos os usuários
  saveUsers: async (users: User[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw error;
    }
  },

  // Obter todos os usuários
  getUsers: async (): Promise<User[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  // Adicionar novo usuário
  addUser: async (user: User): Promise<void> => {
    try {
      const users = await storageService.getUsers();
      users.push(user);
      await storageService.saveUsers(users);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      throw error;
    }
  },

  // Buscar usuário por email
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const users = await storageService.getUsers();
      return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  },

  // Salvar usuário atual (logado)
  setCurrentUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar usuário atual:', error);
      throw error;
    }
  },

  // Obter usuário atual
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  },

  // Remover usuário atual 
  removeCurrentUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Erro ao remover usuário atual:', error);
      throw error;
    }
  },

  // Obter todos os filmes salvos 
  getAllUserMovies: async (): Promise<UserMovie[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_MOVIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar filmes dos usuários:', error);
      return [];
    }
  },

  // Obter filmes de um usuário específico
  getUserMovies: async (userId: string): Promise<UserMovie[]> => {
    try {
      const allMovies = await storageService.getAllUserMovies();
      return allMovies.filter(movie => movie.userId === userId);
    } catch (error) {
      console.error('Erro ao buscar filmes do usuário:', error);
      return [];
    }
  },

  // Adicionar filme à lista do usuário
  addUserMovie: async (userMovie: UserMovie): Promise<void> => {
    try {
      const allMovies = await storageService.getAllUserMovies();
      
      // Verifica se o filme já existe para este usuário
      const existingIndex = allMovies.findIndex(
        m => m.movieId === userMovie.movieId && m.userId === userMovie.userId
      );

      if (existingIndex >= 0) {
        allMovies[existingIndex] = userMovie;
      } else {
        allMovies.push(userMovie);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_MOVIES, JSON.stringify(allMovies));
    } catch (error) {
      console.error('Erro ao adicionar filme do usuário:', error);
      throw error;
    }
  },

  // Remover filme da lista do usuário
  removeUserMovie: async (userId: string, movieId: number): Promise<void> => {
    try {
      const allMovies = await storageService.getAllUserMovies();
      const filteredMovies = allMovies.filter(
        m => !(m.movieId === movieId && m.userId === userId)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.USER_MOVIES, JSON.stringify(filteredMovies));
    } catch (error) {
      console.error('Erro ao remover filme do usuário:', error);
      throw error;
    }
  },

  // Verificar se filme já foi adicionado pelo usuário
  hasUserMovie: async (userId: string, movieId: number): Promise<boolean> => {
    try {
      const userMovies = await storageService.getUserMovies(userId);
      return userMovies.some(m => m.movieId === movieId);
    } catch (error) {
      console.error('Erro ao verificar filme do usuário:', error);
      return false;
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  },
};