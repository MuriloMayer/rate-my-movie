import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { MoviesProvider } from './src/context/MoviesContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <MoviesProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </MoviesProvider>
    </AuthProvider>
  );
}