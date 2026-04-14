import React from 'react';

interface LiveRegionProps {
  children: React.ReactNode;
}

const LiveRegion: React.FC<LiveRegionProps> = ({ children }) => {
  return <div aria-live="assertive">{children}</div>;
};

export default LiveRegion;