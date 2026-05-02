import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export function useBottomTabOverflow() {
  const tabBarHeight = useBottomTabBarHeight();
  return tabBarHeight;
}

