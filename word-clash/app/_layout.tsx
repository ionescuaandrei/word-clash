import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  useFonts({
    'Roboto-Black': require('@/assets/fonts/Roboto-Black.ttf'),
    'Roboto-Bold': require('@/assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Light': require('@/assets/fonts/Roboto-Light.ttf'),
    'Roboto-Medium': require('@/assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Regular': require('@/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Thin': require('@/assets/fonts/Roboto-Thin.ttf'),
    'Roboto-Italic': require('@/assets/fonts/Roboto-Italic.ttf'),
    'Bungee-Spice': require('@/assets/fonts/BungeeSpice-Regular.ttf'),

  })
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Stack screenOptions={{ headerShown: false }}/> 
      </SafeAreaView>
    </SafeAreaProvider>
  ); 
}
