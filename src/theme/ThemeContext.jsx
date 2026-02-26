import React, {createContext, useContext, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({children}) {
  const systemIsDark = useColorScheme() === 'dark';
  const [manualTheme, setManualTheme] = useState(null);

  const isDark = manualTheme === null ? systemIsDark : manualTheme;

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setManualTheme(prev => (prev === null ? !systemIsDark : !prev)),
    }),
    [isDark, systemIsDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
