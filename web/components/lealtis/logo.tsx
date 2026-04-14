import { cn } from '@/lib/utils'

interface LealtisLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LealtisLogo({ size = 'md', className }: LealtisLogoProps) {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  const fontSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  const pixelSize = sizeMap[size]

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
    >
      {/* Navy background */}
      <rect width="32" height="32" rx="4" fill="#1B3A6B" />
      
      {/* Gold accent line at bottom */}
      <rect y="28" width="32" height="2" fill="#C9A84C" />
      
      {/* LEALTIS text in white */}
      <text
        x="16"
        y="18"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        LEALTIS
      </text>
    </svg>
  )
}
