import axios from 'axios';
import { Movie } from '../@types/movie';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
  },
});

export interface TMDbMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export const movieApi = {
  // Buscar filmes por texto
  searchMovies: async (query: string, page: number = 1): Promise<TMDbMovieResponse> => {
    try {
      const response = await api.get('/search/movie', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      throw error;
    }
  },

  // Obter detalhes de um filme específico
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    try {
      const response = await api.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      throw error;
    }
  },

  // Obter filmes populares 
  getPopularMovies: async (page: number = 1): Promise<TMDbMovieResponse> => {
    try {
      const response = await api.get('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
      throw error;
    }
  },

  // Função helper para construir URL de imagem
  getImageUrl: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string => {
    if (!path) return 'https://via.placeholder.com/500x750?text=Sem+Imagem';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },
};

export default api;