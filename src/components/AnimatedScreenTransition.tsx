import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedScreenTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  style?: any;
  className?: string;
}

const AnimatedScreenTransition: React.FC<AnimatedScreenTransitionProps> = ({
  children,
  direction = 'up',
  duration = 300,
  delay = 0,
  style,
  className,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    const timer = setTimeout(() => {
      switch (direction) {
        case 'left':
          translateX.value = -100;
          break;
        case 'right':
          translateX.value = 100;
          break;
        case 'up':
          translateY.value = -100;
          break;
        case 'down':
          translateY.value = 100;
          break;
      }

      translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, delay);

    return () => clearTimeout(timer);
  }, [direction, duration, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className={className}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedScreenTransition; 