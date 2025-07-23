import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

interface AnimatedLoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: string;
  style?: any;
  className?: string;
}

const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  size = 'medium',
  text,
  color,
  style,
  className,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });

    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <View className={`items-center justify-center ${className || ''}`} style={style}>
      <Animated.View style={animatedStyle}>
        <MaterialIcons
          name="refresh"
          size={getSize()}
          color={color || '#FE7359'}
        />
      </Animated.View>
      
      {text && (
        <Text className={`mt-2 ${getTextSize()} text-center`} style={{ color }}>
          {text}
        </Text>
      )}
    </View>
  );
};

export default AnimatedLoading; 