/**
 * Standardized result type for Server Actions
 *
 * This provides a consistent error handling pattern across all server actions.
 *
 * @example Success with data
 * ```ts
 * return { success: true, data: newPet }
 * ```
 *
 * @example Success without data
 * ```ts
 * return { success: true }
 * ```
 *
 * @example Error
 * ```ts
 * return { success: false, error: 'No autorizado' }
 * ```
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * Type guard to check if an action result is successful
 */
export function isSuccess<T>(result: ActionResult<T>): result is { success: true; data?: T } {
  return result.success === true
}

/**
 * Type guard to check if an action result is an error
 */
export function isError<T>(result: ActionResult<T>): result is { success: false; error: string } {
  return result.success === false
}
