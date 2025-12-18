/**
 * Dynamic Icon Component
 *
 * DEPRECATED: This component imports all lucide-react icons which increases bundle size.
 * Prefer using the optimized DynamicIcon from @/lib/icons instead.
 *
 * For gradual migration, this component remains but should be phased out.
 */

import { DynamicIcon as OptimizedDynamicIcon } from '@/lib/icons';

interface DynamicIconProps {
  name?: string;
  className?: string;
}

/**
 * @deprecated Use DynamicIcon from '@/lib/icons' instead for better tree-shaking
 */
export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  return <OptimizedDynamicIcon name={name} className={className} />;
};
