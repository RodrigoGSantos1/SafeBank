import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

interface PullToRefreshProps extends Omit<RefreshControlProps, 'colors' | 'tintColor' | 'progressBackgroundColor' | 'titleColor'> {
  title?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  title = "Pull to refresh...", 
  ...props 
}) => {
  return (
    <RefreshControl
      tintColor="#FE7359"
      colors={["#FE7359"]}
      progressBackgroundColor="#ffffff"
      title={title}
      titleColor="#FE7359"
      {...props}
    />
  );
};

export default PullToRefresh; 