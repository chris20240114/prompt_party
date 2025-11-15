import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, ThemeName } from '../context/ThemeContext';

const themeNames: ThemeName[] = ['classic', 'modern', 'minimal', 'bold', 'cozy', 'neon', 'elegant', 'retro', 'soft', 'midnight'];

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, styles: themeStyles } = useTheme();

  return (
    <View style={[styles.container, {
      backgroundColor: themeStyles.surface,
      borderBottomColor: themeStyles.border,
    }]}>
      {themeNames.map((theme) => (
        <TouchableOpacity
          key={theme}
          onPress={() => setTheme(theme)}
          style={[
            styles.button,
            {
              backgroundColor: currentTheme === theme ? themeStyles.primary : themeStyles.primaryLight,
              borderRadius: themeStyles.radiusS,
            }
          ]}
        >
          <Text style={[
            styles.buttonText,
            {
              color: currentTheme === theme ? '#fff' : themeStyles.textSecondary,
              fontWeight: currentTheme === theme ? themeStyles.fontWeightBold : themeStyles.fontWeightMedium,
              fontSize: themeStyles.fontSizeXS,
            }
          ]}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    textTransform: 'capitalize',
  },
});
