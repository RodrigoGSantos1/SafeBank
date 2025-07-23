import React from 'react';
import { View, ViewProps } from 'react-native';
import useResponsive from '../hooks/useResponsive';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  margin?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
  style?: any;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  padding = 'base',
  margin = 'xs',
  className,
  style,
  ...props
}) => {
  const { spacing } = useResponsive();

  const containerStyle = {
    padding: spacing[padding],
    margin: spacing[margin],
    ...style,
  };

  return (
    <View
      style={containerStyle}
      className={className}
      {...props}
    >
      {children}
    </View>
  );
};

export default ResponsiveContainer; 