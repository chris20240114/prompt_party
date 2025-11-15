import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type ThemeStyles = {
  [key: string]: ViewStyle | TextStyle | ImageStyle | any;
};

export type ThemeName = 'classic' | 'modern' | 'minimal' | 'bold' | 'cozy' | 'neon' | 'elegant' | 'retro' | 'soft' | 'midnight';

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
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('classic');

  const themes: Record<ThemeName, ThemeStyles> = {
    // THEME 1: Classic (Current Purple) - Balanced, professional
    classic: {
      // Global colors
      background: "#f9f5fd",
      surface: "#fff",
      primary: "#6c63ff",
      primaryLight: "#f0ebff",
      text: "#333",
      textSecondary: "#666",
      border: "#ddd",

      // Typography
      fontSizeXL: 38,
      fontSizeL: 28,
      fontSizeM: 24,
      fontSizeS: 16,
      fontSizeXS: 14,
      fontWeightBold: "800",
      fontWeightSemiBold: "700",
      fontWeightMedium: "600",

      // Spacing
      spacingXL: 40,
      spacingL: 24,
      spacingM: 16,
      spacingS: 12,
      spacingXS: 8,

      // Border radius
      radiusXL: 24,
      radiusL: 16,
      radiusM: 12,
      radiusS: 10,
      radiusXS: 8,

      // Component specific
      promptBoxPadding: 40,
      cardPadding: 15,
      inputHeight: 120,
    },

    // THEME 2: Modern - Large, spacious, clean
    modern: {
      background: "#f5f5f7",
      surface: "#ffffff",
      primary: "#007aff",
      primaryLight: "#e5f1ff",
      text: "#1d1d1f",
      textSecondary: "#6e6e73",
      border: "#d2d2d7",

      fontSizeXL: 44,
      fontSizeL: 32,
      fontSizeM: 26,
      fontSizeS: 18,
      fontSizeXS: 15,
      fontWeightBold: "700",
      fontWeightSemiBold: "600",
      fontWeightMedium: "500",

      spacingXL: 48,
      spacingL: 28,
      spacingM: 20,
      spacingS: 14,
      spacingXS: 10,

      radiusXL: 28,
      radiusL: 20,
      radiusM: 16,
      radiusS: 12,
      radiusXS: 10,

      promptBoxPadding: 48,
      cardPadding: 20,
      inputHeight: 140,
    },

    // THEME 3: Minimal - Compact, efficient, clean lines
    minimal: {
      background: "#fafafa",
      surface: "#ffffff",
      primary: "#000000",
      primaryLight: "#f0f0f0",
      text: "#000000",
      textSecondary: "#666666",
      border: "#e0e0e0",

      fontSizeXL: 32,
      fontSizeL: 24,
      fontSizeM: 20,
      fontSizeS: 14,
      fontSizeXS: 12,
      fontWeightBold: "600",
      fontWeightSemiBold: "500",
      fontWeightMedium: "500",

      spacingXL: 32,
      spacingL: 20,
      spacingM: 12,
      spacingS: 8,
      spacingXS: 6,

      radiusXL: 12,
      radiusL: 8,
      radiusM: 6,
      radiusS: 4,
      radiusXS: 4,

      promptBoxPadding: 28,
      cardPadding: 12,
      inputHeight: 100,
    },

    // THEME 4: Bold - Vibrant, playful, energetic
    bold: {
      background: "#fff0f5",
      surface: "#ffffff",
      primary: "#ff1744",
      primaryLight: "#ffe0e6",
      text: "#2d2d2d",
      textSecondary: "#5a5a5a",
      border: "#ffc1d4",

      fontSizeXL: 42,
      fontSizeL: 30,
      fontSizeM: 26,
      fontSizeS: 17,
      fontSizeXS: 15,
      fontWeightBold: "900",
      fontWeightSemiBold: "800",
      fontWeightMedium: "700",

      spacingXL: 44,
      spacingL: 26,
      spacingM: 18,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 32,
      radiusL: 24,
      radiusM: 16,
      radiusS: 12,
      radiusXS: 10,

      promptBoxPadding: 44,
      cardPadding: 18,
      inputHeight: 130,
    },

    // THEME 5: Cozy - Warm, comfortable, rounded
    cozy: {
      background: "#fef9f3",
      surface: "#fffbf5",
      primary: "#d97706",
      primaryLight: "#fef3c7",
      text: "#292524",
      textSecondary: "#78716c",
      border: "#e7e5e4",

      fontSizeXL: 36,
      fontSizeL: 26,
      fontSizeM: 22,
      fontSizeS: 16,
      fontSizeXS: 14,
      fontWeightBold: "700",
      fontWeightSemiBold: "600",
      fontWeightMedium: "500",

      spacingXL: 36,
      spacingL: 22,
      spacingM: 16,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 30,
      radiusL: 22,
      radiusM: 18,
      radiusS: 14,
      radiusXS: 12,

      promptBoxPadding: 36,
      cardPadding: 16,
      inputHeight: 110,
    },

    // THEME 6: Neon - Vibrant dark with glowing accents
    neon: {
      background: "#0a0a0a",
      surface: "#1a1a1a",
      primary: "#00ff88",
      primaryLight: "#1a3329",
      text: "#ffffff",
      textSecondary: "#a0a0a0",
      border: "#333333",

      fontSizeXL: 40,
      fontSizeL: 28,
      fontSizeM: 24,
      fontSizeS: 16,
      fontSizeXS: 14,
      fontWeightBold: "900",
      fontWeightSemiBold: "700",
      fontWeightMedium: "600",

      spacingXL: 42,
      spacingL: 24,
      spacingM: 16,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 20,
      radiusL: 16,
      radiusM: 12,
      radiusS: 10,
      radiusXS: 8,

      promptBoxPadding: 38,
      cardPadding: 16,
      inputHeight: 125,
    },

    // THEME 7: Elegant - Sophisticated serif with gold accents
    elegant: {
      background: "#faf8f5",
      surface: "#ffffff",
      primary: "#8b6914",
      primaryLight: "#fef7e0",
      text: "#1a1a1a",
      textSecondary: "#6b6b6b",
      border: "#d4c5a9",

      fontSizeXL: 40,
      fontSizeL: 30,
      fontSizeM: 24,
      fontSizeS: 17,
      fontSizeXS: 14,
      fontWeightBold: "700",
      fontWeightSemiBold: "600",
      fontWeightMedium: "500",

      spacingXL: 44,
      spacingL: 26,
      spacingM: 18,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 16,
      radiusL: 12,
      radiusM: 8,
      radiusS: 6,
      radiusXS: 4,

      promptBoxPadding: 42,
      cardPadding: 18,
      inputHeight: 130,
    },

    // THEME 8: Retro - 80s inspired with gradients
    retro: {
      background: "#ffe5f4",
      surface: "#fff0f8",
      primary: "#ff0080",
      primaryLight: "#ffc8e8",
      text: "#2d1b2e",
      textSecondary: "#7d5a7e",
      border: "#ffb3de",

      fontSizeXL: 42,
      fontSizeL: 30,
      fontSizeM: 25,
      fontSizeS: 17,
      fontSizeXS: 15,
      fontWeightBold: "900",
      fontWeightSemiBold: "800",
      fontWeightMedium: "700",

      spacingXL: 40,
      spacingL: 24,
      spacingM: 16,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 24,
      radiusL: 18,
      radiusM: 14,
      radiusS: 10,
      radiusXS: 8,

      promptBoxPadding: 40,
      cardPadding: 16,
      inputHeight: 120,
    },

    // THEME 9: Soft - Gentle pastels with subtle shadows
    soft: {
      background: "#f8f9fe",
      surface: "#ffffff",
      primary: "#8b9fe8",
      primaryLight: "#e8ecfa",
      text: "#3d3d4e",
      textSecondary: "#7a7a8a",
      border: "#d8ddf0",

      fontSizeXL: 36,
      fontSizeL: 27,
      fontSizeM: 22,
      fontSizeS: 16,
      fontSizeXS: 14,
      fontWeightBold: "600",
      fontWeightSemiBold: "600",
      fontWeightMedium: "500",

      spacingXL: 38,
      spacingL: 24,
      spacingM: 16,
      spacingS: 12,
      spacingXS: 8,

      radiusXL: 26,
      radiusL: 20,
      radiusM: 16,
      radiusS: 12,
      radiusXS: 10,

      promptBoxPadding: 38,
      cardPadding: 16,
      inputHeight: 115,
    },

    // THEME 10: Midnight - Deep blue night theme
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
