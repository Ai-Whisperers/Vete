/**
 * Accessibility Utilities
 *
 * Helper functions for improved accessibility throughout the application.
 */

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Announce message to screen readers
 * Creates a live region that announces messages to assistive technology
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return

  const el = document.createElement('div')
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', priority)
  el.setAttribute('aria-atomic', 'true')
  el.className = 'sr-only'
  el.textContent = message
  document.body.appendChild(el)

  // Remove after announcement
  setTimeout(() => el.remove(), 1000)
}

/**
 * Trap focus within a container (for modals, drawers, etc.)
 * Returns cleanup function to remove event listeners
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstEl = focusableElements[0]
  const lastEl = focusableElements[focusableElements.length - 1]

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault()
      lastEl?.focus()
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault()
      firstEl?.focus()
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  firstEl?.focus()

  return () => container.removeEventListener('keydown', handleKeyDown)
}

/**
 * Format number for screen readers with singular/plural
 */
export function formatNumberForSR(num: number, singular: string, plural: string): string {
  return `${num} ${num === 1 ? singular : plural}`
}

/**
 * Create visually hidden text for screen readers
 */
export function createSRText(text: string): string {
  return text
}

/**
 * Check if element is visible to screen readers
 */
export function isAriaHidden(element: HTMLElement): boolean {
  return element.getAttribute('aria-hidden') === 'true'
}

/**
 * Get accessible label for an element
 */
export function getAccessibleLabel(element: HTMLElement): string | null {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent
  )
}

/**
 * Format date for screen readers in Spanish
 */
export function formatDateForSR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-PY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format time for screen readers in Spanish
 */
export function formatTimeForSR(time: Date | string): string {
  const t = typeof time === 'string' ? new Date(time) : time
  return t.toLocaleTimeString('es-PY', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
