import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  delay?: number;
  style?: any;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  delay = 0,
  style,
  className,
}) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const pressStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scale.value,
            [0.9, 1],
            [0.95, 1],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 100 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[animatedStyle, pressStyle, style]}
          className={className}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
};

export default AnimatedCard; 