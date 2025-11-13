export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
  adult?: boolean;
}

export interface UserMovie {
  movieId: number;
  userId: string;
  userRating: number;
  watched: boolean;
  watchedAt: string;
  movieData: Movie;
}
