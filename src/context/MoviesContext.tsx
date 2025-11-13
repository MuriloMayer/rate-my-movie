import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserMovie, Movie } from '../@types/movie';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface MoviesContextData {
  userMovies: UserMovie[];
  loading: boolean;
  addMovie: (movie: Movie, rating: number) => Promise<void>;
  removeMovie: (movieId: number) => Promise<void>;
  updateMovieRating: (movieId: number, rating: number) => Promise<void>;
  hasMovie: (movieId: number) => boolean;
  getMovieRating: (movieId: number) => number | null;
  refreshMovies: () => Promise<void>;
}

const MoviesContext = createContext<MoviesContextData>({} as MoviesContextData);

interface MoviesProviderProps {
  children: ReactNode;
}

export const MoviesProvider: React.FC<MoviesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userMovies, setUserMovies] = useState<UserMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserMovies();
    } else {
      setUserMovies([]);
    }
  }, [user]);

  const loadUserMovies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const movies = await storageService.getUserMovies(user.id);
      setUserMovies(movies);
    } catch (error) {
      console.error('Erro ao carregar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMovie = async (movie: Movie, rating: number) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const userMovie: UserMovie = {
        movieId: movie.id,
        userId: user.id,
        userRating: rating,
        watched: true,
        watchedAt: new Date().toISOString(),
        movieData: movie,
      };

      await storageService.addUserMovie(userMovie);
      await loadUserMovies(); 
    } catch (error) {
      console.error('Erro ao adicionar filme:', error);
      throw error;
    }
  };

  const removeMovie = async (movieId: number) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await storageService.removeUserMovie(user.id, movieId);
      await loadUserMovies(); 
    } catch (error) {
      console.error('Erro ao remover filme:', error);
      throw error;
    }
  };

  const updateMovieRating = async (movieId: number, rating: number) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const existingMovie = userMovies.find(m => m.movieId === movieId);
      
      if (existingMovie) {
        const updatedMovie: UserMovie = {
          ...existingMovie,
          userRating: rating,
          watchedAt: new Date().toISOString(),
        };

        await storageService.addUserMovie(updatedMovie);
        await loadUserMovies();
      }
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  };

  const hasMovie = (movieId: number): boolean => {
    return userMovies.some(m => m.movieId === movieId);
  };

  const getMovieRating = (movieId: number): number | null => {
    const movie = userMovies.find(m => m.movieId === movieId);
    return movie ? movie.userRating : null;
  };

  const refreshMovies = async () => {
    await loadUserMovies();
  };

  return (
    <MoviesContext.Provider
      value={{
        userMovies,
        loading,
        addMovie,
        removeMovie,
        updateMovieRating,
        hasMovie,
        getMovieRating,
        refreshMovies,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MoviesContext);

  if (!context) {
    throw new Error('useMovies deve ser usado dentro de um MoviesProvider');
  }

  return context;
};