import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedHeaderButtonProps {
  icon: string;
  onPress: () => void;
  delay?: number;
  style?: any;
  className?: string;
  children?: React.ReactNode;
}

const AnimatedHeaderButton: React.FC<AnimatedHeaderButtonProps> = ({
  icon,
  onPress,
  delay = 0,
  style,
  className,
  children,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[animatedStyle, style]}
        className={className}
      >
        <MaterialIcons
          name={icon as any}
          size={22}
          color={colors.textPrimary}
        />
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedHeaderButton; 