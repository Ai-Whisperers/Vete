import React from 'react';

interface FlagIconProps {
  locale: string;
}

const FlagIcon: React.FC<FlagIconProps> = ({ locale }) => {
  const flagMap: { [key: string]: string } = {
    en: '🇬🇧',
    es: '🇪🇸',
    // Add more flags as needed
  };

  return <span>{flagMap[locale]}</span>;
};

export default FlagIcon;