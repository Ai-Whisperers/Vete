import { describe, it, expect } from 'vitest'
import type { Product, ProductCategory, ProductFilters } from '@/lib/domain/inventory/types'

describe('Inventory Types', () => {
  describe('Product', () => {
    it('should create a valid product', () => {
      const product: Product = {
        id: 'prod-1',
        tenantId: 'clinic-1',
        name: 'Dog Food Premium',
        sku: 'DFP-001',
        price: 150000,
        isActive: true,
      }

      expect(product.id).toBe('prod-1')
      expect(product.isActive).toBe(true)
    })
  })

  describe('ProductCategory', () => {
    it('should accept valid categories', () => {
      const categories: ProductCategory[] = ['food', 'medicine', 'accessory', 'grooming']
      
      categories.forEach(cat => {
        expect(typeof cat).toBe('string')
      })
    })
  })

  describe('ProductFilters', () => {
    it('should create filters with search', () => {
      const filters: ProductFilters = {
        search: 'dog food',
      }

      expect(filters.search).toBe('dog food')
    })

    it('should create filters with category', () => {
      const filters: ProductFilters = {
        category: 'food',
      }

      expect(filters.category).toBe('food')
    })

    it('should create filters with price range', () => {
      const filters: ProductFilters = {
        minPrice: 10000,
        maxPrice: 50000,
      }

      expect(filters.minPrice).toBe(10000)
      expect(filters.maxPrice).toBe(50000)
    })
  })
})
