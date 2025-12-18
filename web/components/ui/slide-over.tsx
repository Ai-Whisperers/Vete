"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { clsx } from "clsx";

export interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  side?: "right" | "left";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  side = "right",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  footer,
}: SlideOverProps): React.ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Lock body scroll and manage focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => panelRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-2xl",
  };

  const slideVariants = {
    right: {
      hidden: { x: "100%" },
      visible: { x: 0 },
    },
    left: {
      hidden: { x: "-100%" },
      visible: { x: 0 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Panel Container */}
          <div
            className={clsx(
              "fixed inset-y-0 flex",
              side === "right" ? "right-0" : "left-0"
            )}
            onClick={handleBackdropClick}
          >
            <motion.div
              ref={panelRef}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={slideVariants[side]}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "slide-over-title" : undefined}
              aria-describedby={description ? "slide-over-description" : undefined}
              tabIndex={-1}
              className={clsx(
                "relative w-screen flex flex-col bg-white shadow-2xl",
                sizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  {title && (
                    <h2
                      id="slide-over-title"
                      className="text-xl font-bold text-[var(--text-primary)] truncate"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="slide-over-description"
                      className="mt-1 text-sm text-[var(--text-secondary)]"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors -mr-2 shrink-0"
                    aria-label="Cerrar panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Pre-built footer with standard buttons
interface SlideOverFooterProps {
  onCancel: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitVariant?: "primary" | "danger";
}

export function SlideOverFooter({
  onCancel,
  onSubmit,
  cancelLabel = "Cancelar",
  submitLabel = "Guardar",
  isSubmitting = false,
  submitDisabled = false,
  submitVariant = "primary",
}: SlideOverFooterProps): React.ReactElement {
  const submitStyles = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-lg hover:shadow-xl",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl",
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || submitDisabled}
          className={clsx(
            "px-6 py-2.5 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            submitStyles[submitVariant]
          )}
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      )}
    </div>
  );
}
