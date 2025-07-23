import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
  icon: string;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
  onPress?: () => void;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  change,
  changeType = 'neutral',
  color,
  onPress,
  delay = 0,
}) => {
  const { colors } = useTheme();

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return colors.success;
      case 'negative':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return 'trending-up';
      case 'negative':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl p-4 border"
      style={{ 
        backgroundColor: colors.card,
        borderColor: colors.border
      }}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View 
          className="rounded-full p-2 w-10 h-10 items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <MaterialIcons 
            name={icon as any} 
            size={18} 
            color="white" 
          />
        </View>
        
        {change && (
          <View className="flex-row items-center">
            <MaterialIcons 
              name={getChangeIcon() as any} 
              size={14} 
              color={getChangeColor()}
            />
            <Text 
              className="text-xs font-medium ml-1"
              style={{ color: getChangeColor() }}
            >
              {change}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={{ color: colors.textSecondary }} className="text-sm mb-1">
        {title}
      </Text>
      
      <Text style={{ color: colors.textPrimary }} className="text-lg font-bold">
        {value}
      </Text>
    </TouchableOpacity>
  );
}; 