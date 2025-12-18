"use client";

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { validateImageFile, ValidationResult } from '@/lib/image-validation';

interface PhotoUploadProps {
  /** Name attribute for the file input (used in form submission) */
  name?: string;
  /** Current photo URL (for edit mode) */
  currentPhotoUrl?: string;
  /** Called when a valid file is selected */
  onFileSelect?: (file: File) => void;
  /** Called when the file is removed */
  onFileRemove?: () => void;
  /** Custom class name for the container */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Maximum file size in MB (default: 5MB) */
  maxSizeMB?: number;
  /** Shape of the preview */
  shape?: 'circle' | 'square';
  /** Size of the preview in pixels */
  size?: number;
}

export function PhotoUpload({
  name = 'photo',
  currentPhotoUrl,
  onFileSelect,
  onFileRemove,
  className = '',
  placeholder = 'Subir foto',
  disabled = false,
  maxSizeMB = 5,
  shape = 'circle',
  size = 128,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback(async (file: File): Promise<ValidationResult> => {
    // Basic validation first
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)' };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `El archivo es muy grande. Máximo ${maxSizeMB}MB` };
    }

    // Use the validation utility if available
    if (typeof validateImageFile === 'function') {
      return validateImageFile(file, { maxSizeMB });
    }

    return { valid: true };
  }, [maxSizeMB]);

  const processFile = useCallback(async (file: File) => {
    setIsValidating(true);
    setError(null);

    try {
      const validation = await handleFileValidation(file);

      if (!validation.valid) {
        setError(validation.error || 'Archivo inválido');
        setIsValidating(false);
        return;
      }

      // Create preview
      const url = URL.createObjectURL(file);
      setPreview(url);

      // Notify parent
      onFileSelect?.(file);
    } catch {
      setError('Error al procesar la imagen');
    } finally {
      setIsValidating(false);
    }
  }, [handleFileValidation, onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [disabled, processFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileRemove?.();
  }, [onFileRemove]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const containerStyle = {
    width: size,
    height: size,
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Upload Area */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={preview ? 'Cambiar foto' : placeholder}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={containerStyle}
        className={`
          relative group cursor-pointer overflow-hidden
          border-4 transition-all duration-200
          ${shapeClass}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDragging
            ? 'border-[var(--primary)] bg-[var(--primary)]/10 scale-105'
            : preview
              ? 'border-[var(--primary)] shadow-lg'
              : 'border-[var(--border,#e5e7eb)] bg-[var(--bg-subtle)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-subtle)]'
          }
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
        `}
      >
        {/* Preview Image */}
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Hover Overlay */}
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-xs px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  Cambiar
                </span>
              </div>
            )}
            {/* Remove Button */}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Eliminar foto"
                className="absolute -top-1 -right-1 w-7 h-7 bg-[var(--status-error,#ef4444)] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--status-error-dark,#dc2626)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {isValidating ? (
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            ) : (
              <>
                <Camera className="w-10 h-10 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                {isDragging && (
                  <span className="text-[var(--primary)] font-bold text-xs">Soltar aquí</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-center text-xs text-[var(--text-muted)]">
        {isDragging ? (
          <span className="text-[var(--primary)] font-medium">Suelta la imagen</span>
        ) : (
          <span>
            {placeholder} <span className="hidden sm:inline">o arrastra</span>
          </span>
        )}
      </p>

      {/* Error Message */}
      {error && (
        <div role="alert" className="flex items-center gap-2 text-[var(--status-error,#ef4444)] text-xs font-medium bg-[var(--status-error-bg,#fee2e2)] px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Supported Formats Hint */}
      <p className="text-center text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        JPG, PNG, GIF, WebP • Max {maxSizeMB}MB
      </p>
    </div>
  );
}
