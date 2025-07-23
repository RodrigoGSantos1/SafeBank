import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveConfig {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  screenWidth: number;
  screenHeight: number;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  spacing: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
}

const useResponsive = (): ResponsiveConfig => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;

  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isLargeScreen = screenWidth >= 768;

  const fontSize = {
    xs: isSmallScreen ? 10 : isMediumScreen ? 12 : 14,
    sm: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
    base: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
    lg: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
    xl: isSmallScreen ? 18 : isMediumScreen ? 20 : 24,
    '2xl': isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
    '3xl': isSmallScreen ? 24 : isMediumScreen ? 28 : 32,
    '4xl': isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
    '5xl': isSmallScreen ? 32 : isMediumScreen ? 36 : 48,
  };

  const spacing = {
    xs: isSmallScreen ? 2 : isMediumScreen ? 4 : 6,
    sm: isSmallScreen ? 4 : isMediumScreen ? 6 : 8,
    base: isSmallScreen ? 8 : isMediumScreen ? 12 : 16,
    lg: isSmallScreen ? 12 : isMediumScreen ? 16 : 20,
    xl: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
    '2xl': isSmallScreen ? 20 : isMediumScreen ? 24 : 32,
  };

  return {
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    screenWidth,
    screenHeight,
    fontSize,
    spacing,
  };
};

export default useResponsive; 