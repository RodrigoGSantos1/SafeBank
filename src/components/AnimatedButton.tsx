import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  delay?: number;
  style?: any;
  className?: string;
  textStyle?: any;
  textClassName?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  delay = 0,
  style,
  className,
  textStyle,
  textClassName,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
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

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  };

  const getButtonStyle = () => {
    const baseStyle = 'rounded-xl flex-row items-center justify-center';
    
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-primary`;
      case 'secondary':
        return `${baseStyle} bg-secondary`;
      case 'outline':
        return `${baseStyle} border border-primary`;
      case 'ghost':
        return `${baseStyle} bg-transparent`;
      default:
        return `${baseStyle} bg-primary`;
    }
  };

  const getTextStyle = () => {
    const baseStyle = 'font-semibold';
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return `${baseStyle} text-white`;
      case 'outline':
      case 'ghost':
        return `${baseStyle} text-primary`;
      default:
        return `${baseStyle} text-white`;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2';
      case 'large':
        return 'px-8 py-4';
      default:
        return 'px-6 py-3';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <Animated.View
        style={[animatedStyle, style]}
        className={`${getButtonStyle()} ${getSizeStyle()} ${className || ''}`}
      >
        {loading ? (
          <Animated.View style={{ marginRight: 8 }}>
            <MaterialIcons
              name="refresh"
              size={getIconSize()}
              color={variant === 'outline' || variant === 'ghost' ? '#FE7359' : 'white'}
            />
          </Animated.View>
        ) : icon ? (
          <MaterialIcons
            name={icon as any}
            size={getIconSize()}
            color={variant === 'outline' || variant === 'ghost' ? '#FE7359' : 'white'}
            style={{ marginRight: 8 }}
          />
        ) : null}
        
        <Text
          style={textStyle}
          className={`${getTextStyle()} ${textClassName || ''}`}
        >
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedButton; 