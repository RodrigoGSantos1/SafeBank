import { useEffect } from 'react';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export const useAnimations = () => {
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);
  const scale = useSharedValue(0.8);

  const pressScale = useSharedValue(1);

  const animateIn = (callback?: () => void) => {
    fadeIn.value = withTiming(1, { duration: 300 });
    slideUp.value = withSpring(0, { damping: 15, stiffness: 100 });
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    
    if (callback) {
      setTimeout(callback, 300);
    }
  };

  const animatePress = (pressed: boolean) => {
    pressScale.value = withSpring(pressed ? 0.95 : 1, {
      damping: 15,
      stiffness: 100,
    });
  };

  const animateCard = () => {
    const cardScale = useSharedValue(0.9);
    const cardOpacity = useSharedValue(0);

    useEffect(() => {
      cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      cardOpacity.value = withTiming(1, { duration: 400 });
    }, []);

    return { cardScale, cardOpacity };
  };

  const animateButton = () => {
    const buttonScale = useSharedValue(1);
    const buttonOpacity = useSharedValue(0);

    useEffect(() => {
      buttonOpacity.value = withTiming(1, { duration: 300 });
    }, []);

    const handlePress = (pressed: boolean) => {
      buttonScale.value = withSpring(pressed ? 0.95 : 1, {
        damping: 15,
        stiffness: 100,
      });
    };

    return { buttonScale, buttonOpacity, handlePress };
  };

  return {
    fadeIn,
    slideUp,
    scale,
    pressScale,

    animateIn,
    animatePress,
    animateCard,
    animateButton,
  };
}; 