import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedQuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  delay?: number;
  style?: any;
  className?: string;
}

const AnimatedQuickAction: React.FC<AnimatedQuickActionProps> = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
  delay = 0,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 400 });
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
    scale.value = withSpring(0.95, { damping: 15, stiffness: 100 });
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
        <View
          className="rounded-full p-3 w-12 h-12 items-center justify-center mb-3"
          style={{ backgroundColor: color }}
        >
          <MaterialIcons
            name={icon as any}
            size={22}
            color="white"
          />
        </View>
        <Text style={{ color: colors.textPrimary }} className="font-semibold text-base">
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {subtitle}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedQuickAction; 