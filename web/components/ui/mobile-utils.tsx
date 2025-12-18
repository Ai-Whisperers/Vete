"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode, type TouchEvent } from "react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

// ============================================
// Mobile Touch Target Constants
// ============================================

/**
 * Minimum touch target sizes according to WCAG and platform guidelines
 * - Apple HIG: 44x44 points minimum
 * - Material Design: 48x48 dp minimum
 * - WCAG 2.1: 44x44 CSS pixels minimum
 */
export const TOUCH_TARGETS = {
  /** Minimum recommended size (44px) */
  MIN: "min-h-[44px] min-w-[44px]",
  /** Standard button size (48px) */
  BUTTON: "min-h-[48px] min-w-[48px]",
  /** Large touch targets for primary actions (52px) */
  PRIMARY: "min-h-[52px]",
  /** Touch-friendly padding for inline elements */
  PADDING: "px-4 py-3",
  /** Touch-friendly spacing between interactive elements */
  GAP: "gap-3",
} as const;

// ============================================
// Swipeable Card Component
// ============================================

interface SwipeAction {
  icon: keyof typeof Icons;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface SwipeableCardProps {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({
  leftActions = [],
  rightActions = [],
  threshold = 80,
  children,
  className,
  disabled = false,
}: SwipeableCardProps): React.ReactElement {
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: TouchEvent): void => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
    isDraggingRef.current = true;
    setIsTransitioning(false);
  };

  const handleTouchMove = (e: TouchEvent): void => {
    if (!isDraggingRef.current || disabled) return;
    const diff = e.touches[0].clientX - startXRef.current;
    let newTranslate = currentXRef.current + diff;

    // Limit swipe distance based on available actions
    const maxLeft = leftActions.length > 0 ? threshold : 0;
    const maxRight = rightActions.length > 0 ? -threshold : 0;

    newTranslate = Math.min(maxLeft, Math.max(maxRight, newTranslate));
    setTranslateX(newTranslate);
  };

  const handleTouchEnd = (): void => {
    if (!isDraggingRef.current || disabled) return;
    isDraggingRef.current = false;
    setIsTransitioning(true);

    // Snap to open or closed position
    if (translateX > threshold / 2 && leftActions.length > 0) {
      setTranslateX(threshold);
    } else if (translateX < -threshold / 2 && rightActions.length > 0) {
      setTranslateX(-threshold);
    } else {
      setTranslateX(0);
    }
  };

  const resetPosition = (): void => {
    setIsTransitioning(true);
    setTranslateX(0);
  };

  const executeAction = (action: SwipeAction): void => {
    action.onClick();
    resetPosition();
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex items-center">
          {leftActions.map((action, index) => {
            const IconComponent = Icons[action.icon] as React.ComponentType<{ className?: string }>;
            return (
              <button
                key={index}
                onClick={() => executeAction(action)}
                className={cn(
                  "h-full flex flex-col items-center justify-center px-4 min-w-[80px] transition-opacity",
                  action.bgColor,
                  translateX > 20 ? "opacity-100" : "opacity-0"
                )}
                style={{ color: action.color }}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-bold mt-1">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {rightActions.map((action, index) => {
            const IconComponent = Icons[action.icon] as React.ComponentType<{ className?: string }>;
            return (
              <button
                key={index}
                onClick={() => executeAction(action)}
                className={cn(
                  "h-full flex flex-col items-center justify-center px-4 min-w-[80px] transition-opacity",
                  action.bgColor,
                  translateX < -20 ? "opacity-100" : "opacity-0"
                )}
                style={{ color: action.color }}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-bold mt-1">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${translateX}px)` }}
        className={cn(
          "relative bg-white",
          isTransitioning && "transition-transform duration-200"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// Pull to Refresh Component
// ============================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  threshold = 80,
  children,
  className,
}: PullToRefreshProps): React.ReactElement {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(true);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent): void => {
    if (isRefreshing) return;
    // Only allow pull when scrolled to top
    if (containerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      setCanPull(true);
    } else {
      setCanPull(false);
    }
  };

  const handleTouchMove = (e: TouchEvent): void => {
    if (!canPull || isRefreshing) return;
    const diff = e.touches[0].clientY - startYRef.current;
    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5;
      setPullDistance(Math.min(diff * resistance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async (): Promise<void> => {
    if (!canPull || isRefreshing) return;
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold / 2);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("overflow-auto", className)}
    >
      {/* Pull Indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)]/10",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: `rotate(${progress * 180}deg)`,
            opacity: progress,
          }}
        >
          {isRefreshing ? (
            <Icons.Loader2 className="w-5 h-5 text-[var(--primary)]" />
          ) : (
            <Icons.ArrowDown className="w-5 h-5 text-[var(--primary)]" />
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

// ============================================
// Touch Feedback Button
// ============================================

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: keyof typeof Icons;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export function TouchButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: TouchButtonProps): React.ReactElement {
  const [isPressed, setIsPressed] = useState(false);

  const IconComponent = icon ? (Icons[icon] as React.ComponentType<{ className?: string }>) : null;

  const sizeStyles = {
    sm: { button: "px-3 py-2 text-sm min-h-[40px]", icon: "w-4 h-4", gap: "gap-1.5" },
    md: { button: "px-4 py-3 text-base min-h-[48px]", icon: "w-5 h-5", gap: "gap-2" },
    lg: { button: "px-6 py-4 text-lg min-h-[56px]", icon: "w-6 h-6", gap: "gap-2.5" },
  };

  const variantStyles = {
    primary: "bg-[var(--primary)] text-white shadow-lg hover:shadow-xl active:shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
    danger: "bg-red-600 text-white shadow-lg hover:bg-red-700 active:bg-red-800",
  };

  const sizes = sizeStyles[size];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-xl transition-all",
        sizes.button,
        sizes.gap,
        variantStyles[variant],
        fullWidth && "w-full",
        isPressed && "scale-95",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <Icons.Loader2 className={cn(sizes.icon, "animate-spin")} />
      ) : (
        <>
          {IconComponent && iconPosition === "left" && <IconComponent className={sizes.icon} />}
          {children}
          {IconComponent && iconPosition === "right" && <IconComponent className={sizes.icon} />}
        </>
      )}
    </button>
  );
}

// ============================================
// Haptic Feedback Hook (for supported devices)
// ============================================

type HapticStyle = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error";

export function useHaptic(): (style?: HapticStyle) => void {
  const trigger = useCallback((style: HapticStyle = "light"): void => {
    // Check for Vibration API support
    if ("vibrate" in navigator) {
      const patterns: Record<HapticStyle, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        selection: 5,
        success: [10, 50, 10],
        warning: [30, 30, 30],
        error: [50, 100, 50],
      };
      navigator.vibrate(patterns[style]);
    }
  }, []);

  return trigger;
}

// ============================================
// Floating Action Button
// ============================================

interface FloatingActionButtonProps {
  icon: keyof typeof Icons;
  label?: string;
  onClick: () => void;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  color?: "primary" | "secondary" | "success" | "danger";
  extended?: boolean;
  className?: string;
}

export function FloatingActionButton({
  icon,
  label,
  onClick,
  position = "bottom-right",
  color = "primary",
  extended = false,
  className,
}: FloatingActionButtonProps): React.ReactElement {
  const IconComponent = Icons[icon] as React.ComponentType<{ className?: string }>;

  const positionStyles = {
    "bottom-right": "right-4 bottom-4",
    "bottom-left": "left-4 bottom-4",
    "bottom-center": "left-1/2 -translate-x-1/2 bottom-4",
  };

  const colorStyles = {
    primary: "bg-[var(--primary)] text-white shadow-[var(--shadow-lg)]",
    secondary: "bg-gray-900 text-white shadow-xl",
    success: "bg-green-600 text-white shadow-xl",
    danger: "bg-red-600 text-white shadow-xl",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50 flex items-center justify-center rounded-full transition-all",
        "hover:-translate-y-1 hover:shadow-2xl active:scale-95",
        "min-h-[56px]",
        extended ? "px-6 gap-2" : "w-14 h-14",
        positionStyles[position],
        colorStyles[color],
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      aria-label={label}
    >
      <IconComponent className="w-6 h-6" />
      {extended && label && <span className="font-bold">{label}</span>}
    </button>
  );
}

// ============================================
// Mobile-Optimized List Item
// ============================================

interface MobileListItemProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  swipeActions?: {
    left?: SwipeAction[];
    right?: SwipeAction[];
  };
  className?: string;
}

export function MobileListItem({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  href,
  swipeActions,
  className,
}: MobileListItemProps): React.ReactElement {
  const content = (
    <div
      className={cn(
        "flex items-center gap-4 p-4",
        TOUCH_TARGETS.MIN,
        onClick && "cursor-pointer active:bg-gray-50",
        className
      )}
      onClick={onClick}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[var(--text-primary)] truncate">{title}</p>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] truncate">{subtitle}</p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
      {(onClick || href) && !trailing && (
        <Icons.ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
      )}
    </div>
  );

  const wrappedContent = swipeActions ? (
    <SwipeableCard
      leftActions={swipeActions.left}
      rightActions={swipeActions.right}
    >
      {content}
    </SwipeableCard>
  ) : (
    content
  );

  if (href) {
    const Link = require("next/link").default;
    return (
      <Link href={href} className="block">
        {wrappedContent}
      </Link>
    );
  }

  return wrappedContent;
}
