import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type ThemeStyles = {
  [key: string]: ViewStyle | TextStyle | ImageStyle | any;
};

export type ThemeName = 'midnight';

type ThemeContextType = {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  styles: ThemeStyles;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('midnight');

  const themes: Record<ThemeName, ThemeStyles> = {
    // Midnight - Deep blue night theme
    midnight: {
      background: "#0f1419",
      surface: "#1a1f29",
      primary: "#4a9eff",
      primaryLight: "#1e2d3d",
      text: "#e6e8eb",
      textSecondary: "#8b92a0",
      border: "#2d3541",

      fontSizeXL: 38,
      fontSizeL: 28,
      fontSizeM: 24,
      fontSizeS: 16,
      fontSizeXS: 14,
      fontWeightBold: "700",
      fontWeightSemiBold: "600",
      fontWeightMedium: "500",

      spacingXL: 40,
      spacingL: 24,
      spacingM: 16,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 22,
      radiusL: 18,
      radiusM: 14,
      radiusS: 10,
      radiusXS: 8,

      promptBoxPadding: 38,
      cardPadding: 16,
      inputHeight: 120,
    },
  };

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, styles: themes[currentTheme] }}>
      {children}
    </ThemeContext.Provider>
  );
};
