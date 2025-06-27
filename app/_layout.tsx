import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import Header from '@/components/Header';
import { Box } from '@/components/ui/box';
import { CartProvider } from '@/hooks/CartContext';

export default function Layout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <CartProvider>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Box className="min-h-screen flex flex-col">
            <Header />
            <Box className="flex-1">
              <Stack screenOptions={{ headerShown: false }} />
            </Box>
          </Box>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </CartProvider>
  );
}
