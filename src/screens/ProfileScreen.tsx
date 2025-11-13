import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MoviesContext';
import { Button } from '../components';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

const ProfileScreen: React.FC = () => {
  const { user, signOut, updateUserProfile } = useAuth();
  const { userMovies } = useMovies();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // Calcular estatísticas
  const totalMovies = userMovies.length;
  const averageRating = totalMovies > 0
    ? userMovies.reduce((sum, movie) => sum + movie.userRating, 0) / totalMovies
    : 0;

  // Solicitar permissões
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !galleryPermission.granted) {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de permissão para acessar sua câmera e galeria.'
      );
      return false;
    }
    return true;
  };

  // Tirar foto
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateUserProfile({
          ...user,
          profileImage: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  // Escolher da galeria
  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateUserProfile({
          ...user,
          profileImage: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Alterar foto de perfil
  const handleChangePhoto = () => {
    Alert.alert(
      'Alterar Foto de Perfil',
      'Escolha uma opção',
      [
        { text: 'Tirar Foto', onPress: handleTakePhoto },
        { text: 'Escolher da Galeria', onPress: handlePickImage },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Logout
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header com foto de perfil */}
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          {user.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.photo}
              accessibilityLabel={`Foto de perfil de ${user.name}`}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={48} color={colors.textSecondary} />
            </View>
          )}
          
          {/* Botão para editar foto */}
          <TouchableOpacity
            style={styles.editPhotoButton}
            onPress={handleChangePhoto}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            accessibilityHint="Toque para tirar uma foto ou escolher da galeria"
          >
            <Ionicons name="camera" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name} accessibilityRole="header">
          {user.name}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="film" size={32} color={colors.primary} />
          <Text style={styles.statValue}>{totalMovies}</Text>
          <Text style={styles.statLabel}>
            {totalMovies === 1 ? 'Filme Assistido' : 'Filmes Assistidos'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color={colors.warning} />
          <Text style={styles.statValue}>
            {averageRating > 0 ? averageRating.toFixed(1) : '-'}
          </Text>
          <Text style={styles.statLabel}>Avaliação Média</Text>
        </View>
      </View>

      {/* Informações da conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membro desde</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Botão de Logout */}
      <View style={styles.logoutSection}>
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="outline"
          loading={loading}
          fullWidth
          icon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
        />
      </View>

      {/* Versão do App */}
      <Text style={styles.version}>Rate My Movie v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  name: {
    ...typography.title,
    color: colors.text,
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  email: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  version: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;