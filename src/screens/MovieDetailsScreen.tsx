import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppStackParamList } from '../@types/navigation';
import { useMovies } from '../context/MoviesContext';
import { Button } from '../components';
import { movieApi } from '../services/api';
import { colors, spacing, borderRadius } from '../constants/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'MovieDetail'>;

const { width } = Dimensions.get('window');

const MovieDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movie } = route.params;
  const { addMovie, removeMovie, hasMovie, getMovieRating, updateMovieRating } = useMovies();
  
  const [userRating, setUserRating] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se o filme já está salvo
  useEffect(() => {
    const saved = hasMovie(movie.id);
    setIsSaved(saved);
    
    if (saved) {
      const rating = getMovieRating(movie.id);
      if (rating) {
        setUserRating(rating);
      }
    }
  }, [movie.id]);

  // Atualizar título da tela
  useEffect(() => {
    navigation.setOptions({
      title: movie.title,
    });
  }, [movie.title]);

  // Salvar filme
  const handleSaveMovie = async () => {
    if (userRating === 0) {
      Alert.alert(
        'Avaliação necessária',
        'Por favor, selecione uma nota de 1 a 10 para o filme.'
      );
      return;
    }

    try {
      setLoading(true);
      await addMovie(movie, userRating);
      setIsSaved(true);
      Alert.alert('Sucesso!', 'Filme adicionado à sua lista!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o filme');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar avaliação
  const handleUpdateRating = async () => {
    if (userRating === 0) {
      Alert.alert(
        'Avaliação necessária',
        'Por favor, selecione uma nota de 1 a 10 para o filme.'
      );
      return;
    }

    try {
      setLoading(true);
      await updateMovieRating(movie.id, userRating);
      Alert.alert('Sucesso!', 'Avaliação atualizada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a avaliação');
    } finally {
      setLoading(false);
    }
  };

  // Remover filme
  const handleRemoveMovie = () => {
    Alert.alert(
      'Remover Filme',
      `Deseja remover "${movie.title}" da sua lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await removeMovie(movie.id);
              setIsSaved(false);
              setUserRating(0);
              Alert.alert('Removido', 'Filme removido da sua lista');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o filme');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Renderizar estrelas de avaliação
  const renderRatingStars = () => {
    const stars = [];
    const maxRating = 10;

    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setUserRating(i)}
          style={styles.starButton}
          accessibilityRole="button"
          accessibilityLabel={`Avaliar com ${i} ${i === 1 ? 'estrela' : 'estrelas'}`}
          accessibilityState={{ selected: userRating === i }}
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
          <Ionicons
            name={i <= userRating ? 'star' : 'star-outline'}
            size={28}
            color={i <= userRating ? colors.warning : colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  const posterUrl = movieApi.getImageUrl(movie.poster_path, 'w500');
  const backdropUrl = movieApi.getImageUrl(movie.backdrop_path || movie.poster_path, 'original');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Backdrop com gradiente */}
      <View style={styles.backdropContainer}>
        <Image
          source={{ uri: backdropUrl }}
          style={styles.backdrop}
          resizeMode="cover"
          accessibilityLabel={`Imagem de fundo do filme ${movie.title}`}
        />
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.gradient}
        />
      </View>

      <View style={styles.content}>
        {/* Poster e informações básicas */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: posterUrl }}
            style={styles.poster}
            resizeMode="cover"
            accessibilityLabel={`Pôster do filme ${movie.title}`}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.title} accessibilityRole="header">
              {movie.title}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{releaseYear}</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.metaText}>
                  {movie.vote_average.toFixed(1)} / 10
                </Text>
              </View>
            </View>

            {isSaved && (
              <View style={styles.savedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.savedBadgeText}>Na sua lista</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sinopse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.overview}>
            {movie.overview || 'Sinopse não disponível.'}
          </Text>
        </View>

        {/* Avaliação do usuário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isSaved ? 'Sua Avaliação' : 'Avaliar Filme'}
          </Text>
          <Text style={styles.ratingSubtitle}>
            Toque nas estrelas para avaliar (1-10)
          </Text>

          <View style={styles.starsContainer} accessibilityRole="adjustable">
            {renderRatingStars()}
          </View>

          {userRating > 0 && (
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingValue}>{userRating}</Text>
              <Text style={styles.ratingLabel}>/ 10</Text>
            </View>
          )}
        </View>

        {/* Botões de ação */}
        <View style={styles.actionsSection}>
          {!isSaved ? (
            <Button
              title="Adicionar à Minha Lista"
              onPress={handleSaveMovie}
              loading={loading}
              fullWidth
              icon={<Ionicons name="add-circle-outline" size={20} color={colors.text} />}
            />
          ) : (
            <>
              <Button
                title="Atualizar Avaliação"
                onPress={handleUpdateRating}
                loading={loading}
                fullWidth
                icon={<Ionicons name="refresh-outline" size={20} color={colors.text} />}
              />
              <Button
                title="Remover da Lista"
                onPress={handleRemoveMovie}
                loading={loading}
                fullWidth
                variant="outline"
                style={styles.removeButton}
                icon={<Ionicons name="trash-outline" size={20} color={colors.primary} />}
              />
            </>
          )}
        </View>

        {/* Informações adicionais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Título Original:</Text>
            <Text style={styles.infoValue}>{movie.original_title || movie.title}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Idioma Original:</Text>
            <Text style={styles.infoValue}>
              {movie.original_language?.toUpperCase() || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Popularidade:</Text>
            <Text style={styles.infoValue}>
              {movie.popularity?.toFixed(0) || 'N/A'}
            </Text>
          </View>

          {movie.vote_count && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total de Votos:</Text>
              <Text style={styles.infoValue}>
                {movie.vote_count.toLocaleString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdropContainer: {
    width: width,
    height: width * 0.6,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    flexDirection: 'row',
    marginTop: -60,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.background,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  savedBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  overview: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  ratingSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  ratingValue: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  ratingLabel: {
    color: colors.textSecondary,
    fontSize: 24,
    marginLeft: spacing.xs,
  },
  actionsSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  removeButton: {
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MovieDetailScreen;