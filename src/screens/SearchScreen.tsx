import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../@types/navigation';
import { Movie } from '../@types/movie';
import { movieApi } from '../services/api';
import { MovieCard, EmptyState, LoadingScreen } from '../components';
import { colors, spacing, borderRadius } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Carregar filmes populares ao iniciar
  useEffect(() => {
    loadPopularMovies();
  }, []);

  // Buscar filmes populares
  const loadPopularMovies = async () => {
    try {
      setLoadingPopular(true);
      const response = await movieApi.getPopularMovies(1);
      setPopularMovies(response.results);
    } catch (error) {
      console.error('Erro ao carregar filmes populares:', error);
    } finally {
      setLoadingPopular(false);
    }
  };

  // Buscar filmes
  const searchMovies = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setMovies([]);
      setCurrentPage(1);
      setTotalPages(1);
      return;
    }

    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await movieApi.searchMovies(query, page);
      
      if (page === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }
      
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Debounce para busca
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        searchMovies(searchQuery, 1);
      } else {
        setMovies([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Limpar busca
  const handleClearSearch = () => {
    setSearchQuery('');
    setMovies([]);
    Keyboard.dismiss();
  };

  // Carregar mais filmes
  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages && searchQuery) {
      searchMovies(searchQuery, currentPage + 1);
    }
  };

  // Navegar para detalhes
  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  // Renderizar item da lista
  const renderMovieItem = ({ item }: { item: Movie }) => (
    <MovieCard
      movie={item}
      onPress={() => handleMoviePress(item)}
    />
  );

  // Renderizar footer da lista
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Carregando mais filmes...</Text>
      </View>
    );
  };

  // Renderizar lista vazia
  const renderEmpty = () => {
    if (loading || loadingPopular) return null;

    if (searchQuery && movies.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum filme encontrado"
          message={`Não encontramos resultados para "${searchQuery}"`}
        />
      );
    }

    return null;
  };

  // Lista de filmes a exibir
  const displayMovies = searchQuery ? movies : popularMovies;
  const showResults = searchQuery ? movies.length > 0 : popularMovies.length > 0;

  if (loadingPopular && !searchQuery) {
    return <LoadingScreen message="Carregando filmes populares..." />;
  }

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar filmes..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Campo de busca"
            accessibilityHint="Digite o nome de um filme para buscar"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Título da seção */}
      {!searchQuery && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Filmes Populares
          </Text>
        </View>
      )}

      {/* Loading inicial */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Buscando filmes...</Text>
        </View>
      )}

      {/* Lista de filmes */}
      {!loading && showResults && (
        <FlatList
          data={displayMovies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          accessibilityLabel="Lista de filmes"
        />
      )}

      {/* Empty state */}
      {!loading && !showResults && renderEmpty()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});

export default SearchScreen;