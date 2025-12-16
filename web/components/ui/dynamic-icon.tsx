import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  // Safe dynamic access to Lucide icons
  // @ts-ignore
  const Icon = Icons[name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || Icons.HelpCircle;
  
  return <Icon className={className} />;
};
