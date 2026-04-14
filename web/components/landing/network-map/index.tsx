/**
 * Network Map Module
 *
 * Clinic network map section with search, filtering, and interactive map.
 *
 * @example
 * ```tsx
 * import { NetworkMap } from './network-map'
 *
 * <NetworkMap />
 * ```
 */

export { NetworkMap } from './NetworkMap'

export type { TenantLocation } from './types'

// Sub-components (for advanced usage)
export { TenantListItem } from './TenantListItem'
export { TenantDetailPanel } from './TenantDetailPanel'
export { SearchFilters } from './SearchFilters'
export { MapDisplay } from './MapDisplay'

// Data exports
export { tenantLocations, specialtyIcons, allCities, allSpecialties } from './data'
