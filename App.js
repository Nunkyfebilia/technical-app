import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Styling & Context Imports
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';

// 2. Screen Imports
import LoginScreen from './src/LoginScreen';
import HomeScreen from './src/HomeScreen';
import ProductDetailScreen from './src/ProductDetailScreen';

const Stack = createNativeStackNavigator();

// --- Navigation Themes ---
const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    primary: '#4F46E5',
  },
};

const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#020617',
    card: '#0F172A',
    border: '#1E293B',
    text: '#E2E8F0',
    primary: '#818CF8',
  },
};

// --- Main Navigator ---

function AppNavigator() {
  const { isDark } = useAppTheme();

  return (
    <NavigationContainer theme={isDark ? darkNavigationTheme : lightNavigationTheme}>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: isDark ? '#E2E8F0' : '#111827',
          },
          headerTintColor: isDark ? '#A5B4FC' : '#4F46E5',
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          options={{ 
            title: 'Product Details', 
            headerBackTitleVisible: false 
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Root App Component ---
export default function App() {
  // Checks the device's system theme to set the initial StatusBar text color
  const isSystemDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle={isSystemDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
