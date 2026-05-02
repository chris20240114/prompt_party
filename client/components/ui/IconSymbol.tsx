import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleSheet, TextStyle } from 'react-native';

export type IconSymbolProps = {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  weight?: SymbolWeight;
  style?: TextStyle;
};

export function IconSymbol({ name, size = 24, color, weight = 'regular', style }: IconSymbolProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      type="monochrome"
      style={StyleSheet.flatten([{ width: size, height: size }, style])}
    />
  );
}

