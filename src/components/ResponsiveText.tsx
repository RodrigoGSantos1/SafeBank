import React from 'react';
import { Text, TextProps } from 'react-native';

interface ResponsiveTextProps extends TextProps {
  children: React.ReactNode;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  style?: any;
  className?: string;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  numberOfLines = 1,
  adjustsFontSizeToFit = true,
  minimumFontScale = 0.7,
  style,
  className,
  ...props
}) => {
  return (
    <Text
      style={style}
      className={className}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText; 