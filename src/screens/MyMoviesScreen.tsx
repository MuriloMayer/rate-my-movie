import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../@types/navigation';
import { UserMovie } from '../@types/movie';
import { useMovies } from '../context/MoviesContext';
import { MovieCard, EmptyState, LoadingScreen } from '../components';
import { colors, spacing } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type SortOption = 'date' | 'rating' | 'title';

const MyMoviesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userMovies, loading, removeMovie } = useMovies();
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // Ordenar filmes
  const getSortedMovies = (): UserMovie[] => {
    const sorted = [...userMovies];

    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => 
          new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
        );
      case 'rating':
        return sorted.sort((a, b) => b.userRating - a.userRating);
      case 'title':
        return sorted.sort((a, b) => 
          a.movieData.title.localeCompare(b.movieData.title)
        );
      default:
        return sorted;
    }
  };

  // Confirmar remoção de filme
  const handleRemoveMovie = (movieId: number, movieTitle: string) => {
    Alert.alert(
      'Remover Filme',
      `Deseja remover "${movieTitle}" da sua lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMovie(movieId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o filme');
            }
          },
        },
      ]
    );
  };

  // Navegar para detalhes
  const handleMoviePress = (userMovie: UserMovie) => {
    navigation.navigate('MovieDetail', { movie: userMovie.movieData });
  };

  // Renderizar item da lista
  const renderMovieItem = ({ item }: { item: UserMovie }) => (
    <View style={styles.movieItemContainer}>
      <MovieCard
        movie={item.movieData}
        onPress={() => handleMoviePress(item)}
        userRating={item.userRating}
        showRating
      />
      
      {/* Botão de remover */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveMovie(item.movieId, item.movieData.title)}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${item.movieData.title} da lista`}
        accessibilityHint="Toque para remover este filme da sua lista"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  // Renderizar header da lista
  const renderHeader = () => {
    if (userMovies.length === 0) return null;

    return (
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userMovies.length}</Text>
            <Text style={styles.statLabel}>
              {userMovies.length === 1 ? 'Filme' : 'Filmes'}
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(userMovies.reduce((sum, m) => sum + m.userRating, 0) / userMovies.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Média</Text>
          </View>
        </View>

        {/* Opções de ordenação */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Ordenar por:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
              onPress={() => setSortBy('date')}
              accessibilityRole="button"
              accessibilityLabel="Ordenar por data"
              accessibilityState={{ selected: sortBy === 'date' }}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={sortBy === 'date' ? colors.text : colors.textSecondary}
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'date' && styles.sortButtonTextActive
              ]}>
                Data
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
              onPress={() => setSortBy('rating')}
              accessibilityRole="button"
              accessibilityLabel="Ordenar por avaliação"
              accessibilityState={{ selected: sortBy === 'rating' }}
            >
              <Ionicons
                name="star-outline"
                size={16}
                color={sortBy === 'rating' ? colors.text : colors.textSecondary}
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'rating' && styles.sortButtonTextActive
              ]}>
                Nota
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'title' && styles.sortButtonActive]}
              onPress={() => setSortBy('title')}
              accessibilityRole="button"
              accessibilityLabel="Ordenar por título"
              accessibilityState={{ selected: sortBy === 'title' }}
            >
              <Ionicons
                name="text-outline"
                size={16}
                color={sortBy === 'title' ? colors.text : colors.textSecondary}
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === 'title' && styles.sortButtonTextActive
              ]}>
                A-Z
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Loading
  if (loading) {
    return <LoadingScreen message="Carregando seus filmes..." />;
  }

  // Lista vazia
  if (userMovies.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="film-outline"
          title="Nenhum filme na lista"
          message="Busque e avalie filmes para vê-los aqui!"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={getSortedMovies()}
        renderItem={renderMovieItem}
        keyExtractor={(item) => `${item.movieId}-${item.userId}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Lista de filmes assistidos"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  sortContainer: {
    marginBottom: spacing.sm,
  },
  sortLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  movieItemContainer: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default MyMoviesScreen;