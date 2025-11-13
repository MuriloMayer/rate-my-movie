import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../@types/movie';
import { colors, spacing, borderRadius } from '../constants/theme';
import { movieApi } from '../services/api';

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  userRating?: number;
  showRating?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  userRating,
  showRating = false,
}) => {
  const posterUrl = movieApi.getImageUrl(movie.poster_path, 'w342');
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${movie.title}, lançado em ${releaseYear}`}
      accessibilityHint="Toque para ver detalhes do filme"
      activeOpacity={0.8}
    >
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: posterUrl }}
          style={styles.poster}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel={`Pôster do filme ${movie.title}`}
        />
        
        {/* Badge de avaliação TMDb */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={styles.ratingText}>
            {movie.vote_average.toFixed(1)}
          </Text>
        </View>

        {/* Badge de avaliação do usuário */}
        {showRating && userRating && (
          <View style={styles.userRatingBadge}>
            <Ionicons name="heart" size={12} color={colors.error} />
            <Text style={styles.userRatingText}>
              {userRating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={styles.title}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {movie.title}
        </Text>
        <Text style={styles.year}>{releaseYear}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  posterContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  userRatingBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  userRatingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  year: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});