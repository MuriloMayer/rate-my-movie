import { Movie } from './movie';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Search: undefined;
  MyMovies: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  MovieDetail: {
    movie: Movie;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};