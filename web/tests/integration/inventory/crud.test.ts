/**
 * Integration Tests: Inventory Management
 *
 * Tests product and inventory CRUD operations.
 * @tags integration, inventory, high
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  getTestClient,
  TestContext,
  waitForDatabase,
} from '../../__helpers__/db';
import { resetSequence } from '../../__helpers__/factories';
import { DEFAULT_TENANT } from '../../__fixtures__/tenants';

describe('Inventory Management', () => {
  const ctx = new TestContext();
  let client: ReturnType<typeof getTestClient>;

  beforeAll(async () => {
    await waitForDatabase();
    client = getTestClient();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  beforeEach(() => {
    resetSequence();
  });

  describe('PRODUCTS - CREATE', () => {
    test('creates product with required fields', async () => {
      const { data, error } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'Dog Food Premium',
          category: 'Alimentos',
          price: 50000,
          stock: 100,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.name).toBe('Dog Food Premium');
      expect(data.price).toBe(50000);
      expect(data.stock).toBe(100);

      ctx.track('products', data.id);
    });

    test('creates product with all fields', async () => {
      const { data, error } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'Anti-Pulgas Spray',
          category: 'Farmacia',
          price: 35000,
          stock: 50,
          image_url: 'https://storage.example.com/products/spray.jpg',
          description: 'Spray anti-pulgas y garrapatas. Uso externo.',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.description).toContain('anti-pulgas');
      expect(data.image_url).toBeDefined();

      ctx.track('products', data.id);
    });

    test('creates products in different categories', async () => {
      const categories = ['Alimentos', 'Farmacia', 'Accesorios', 'Higiene', 'Juguetes'];

      for (const category of categories) {
        const { data, error } = await client
          .from('products')
          .insert({
            tenant_id: DEFAULT_TENANT.id,
            name: `Test Product - ${category}`,
            category,
            price: 10000,
            stock: 10,
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data.category).toBe(category);
        ctx.track('products', data.id);
      }
    });

    test('fails without name', async () => {
      const { error } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          category: 'Test',
          price: 1000,
          stock: 10,
        });

      expect(error).not.toBeNull();
    });

    test('fails without category', async () => {
      const { error } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'No Category Product',
          price: 1000,
          stock: 10,
        });

      expect(error).not.toBeNull();
    });
  });

  describe('PRODUCTS - READ', () => {
    let productId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'Read Test Product',
          category: 'Test',
          price: 25000,
          stock: 75,
          description: 'Product for read tests',
        })
        .select()
        .single();
      productId = data.id;
      ctx.track('products', productId);
    });

    test('reads product by ID', async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      expect(error).toBeNull();
      expect(data.name).toBe('Read Test Product');
    });

    test('reads products by tenant', async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.length).toBeGreaterThan(0);
    });

    test('filters products by category', async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .eq('category', 'Alimentos');

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.every((p: { category: string }) => p.category === 'Alimentos')).toBe(true);
    });

    test('searches products by name', async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .ilike('name', '%Dog%');

      expect(error).toBeNull();
    });

    test('orders products by price', async () => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .order('price', { ascending: true });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      // Verify ascending order
      for (let i = 1; i < data!.length; i++) {
        expect(data![i].price).toBeGreaterThanOrEqual(data![i - 1].price);
      }
    });

    test('paginates products', async () => {
      const { data: page1, error: error1 } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .range(0, 4);

      expect(error1).toBeNull();
      expect(page1).not.toBeNull();
      expect(page1!.length).toBeLessThanOrEqual(5);

      const { data: page2, error: error2 } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .range(5, 9);

      expect(error2).toBeNull();
    });
  });

  describe('PRODUCTS - UPDATE', () => {
    let updateProductId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'Update Test Product',
          category: 'Test',
          price: 15000,
          stock: 50,
        })
        .select()
        .single();
      updateProductId = data.id;
      ctx.track('products', updateProductId);
    });

    test('updates price', async () => {
      const { data, error } = await client
        .from('products')
        .update({ price: 18000 })
        .eq('id', updateProductId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.price).toBe(18000);
    });

    test('updates stock', async () => {
      const { data, error } = await client
        .from('products')
        .update({ stock: 75 })
        .eq('id', updateProductId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.stock).toBe(75);
    });

    test('updates description', async () => {
      const { data, error } = await client
        .from('products')
        .update({ description: 'Updated product description' })
        .eq('id', updateProductId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.description).toBe('Updated product description');
    });

    test('updates category', async () => {
      const { data, error } = await client
        .from('products')
        .update({ category: 'Accesorios' })
        .eq('id', updateProductId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.category).toBe('Accesorios');
    });
  });

  describe('PRODUCTS - DELETE', () => {
    test('deletes product by ID', async () => {
      // Create product to delete
      const { data: created } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'To Delete Product',
          category: 'Test',
          price: 1000,
          stock: 1,
        })
        .select()
        .single();

      // Delete it
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', created.id);

      expect(error).toBeNull();

      // Verify deleted
      const { data: found } = await client
        .from('products')
        .select('*')
        .eq('id', created.id)
        .single();

      expect(found).toBeNull();
    });
  });

  describe('STOCK MANAGEMENT', () => {
    let stockProductId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'Stock Test Product',
          category: 'Test',
          price: 10000,
          stock: 100,
        })
        .select()
        .single();
      stockProductId = data.id;
      ctx.track('products', stockProductId);
    });

    test('decrements stock on sale', async () => {
      // Simulate a sale of 5 items
      const { data: before } = await client
        .from('products')
        .select('stock')
        .eq('id', stockProductId)
        .single();

      expect(before).not.toBeNull();

      const { data, error } = await client
        .from('products')
        .update({ stock: before!.stock - 5 })
        .eq('id', stockProductId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.stock).toBe(before!.stock - 5);
    });

    test('increments stock on restock', async () => {
      const { data: before } = await client
        .from('products')
        .select('stock')
        .eq('id', stockProductId)
        .single();

      expect(before).not.toBeNull();

      const { data, error } = await client
        .from('products')
        .update({ stock: before!.stock + 50 })
        .eq('id', stockProductId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.stock).toBe(before!.stock + 50);
    });

    test('finds low stock products', async () => {
      const lowStockThreshold = 10;

      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .lte('stock', lowStockThreshold);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.every((p: { stock: number }) => p.stock <= lowStockThreshold)).toBe(true);
    });

    test('finds out of stock products', async () => {
      // Create out of stock product
      const { data: outOfStock } = await client
        .from('products')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          name: 'Out of Stock Product',
          category: 'Test',
          price: 5000,
          stock: 0,
        })
        .select()
        .single();
      ctx.track('products', outOfStock.id);

      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .eq('stock', 0);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.some((p: { id: string }) => p.id === outOfStock!.id)).toBe(true);
    });
  });

  describe('INVENTORY REPORTS', () => {
    test('calculates total inventory value', async () => {
      const { data, error } = await client
        .from('products')
        .select('price, stock')
        .eq('tenant_id', DEFAULT_TENANT.id);

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const totalValue = data!.reduce(
        (sum: number, p: { price: number; stock: number }) => sum + p.price * p.stock,
        0
      );

      expect(totalValue).toBeGreaterThan(0);
    });

    test('groups products by category with count', async () => {
      const { data, error } = await client
        .from('products')
        .select('category')
        .eq('tenant_id', DEFAULT_TENANT.id);

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const byCategory = data!.reduce(
        (acc: Record<string, number>, p: { category: string }) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        },
        {}
      );

      expect(Object.keys(byCategory).length).toBeGreaterThan(0);
    });
  });

  describe('MULTI-TENANT ISOLATION', () => {
    test('products are isolated by tenant', async () => {
      // Create product in petlife
      const { data: petlifeProduct } = await client
        .from('products')
        .insert({
          tenant_id: 'petlife',
          name: 'PetLife Exclusive',
          category: 'Test',
          price: 99999,
          stock: 1,
        })
        .select()
        .single();
      ctx.track('products', petlifeProduct.id);

      // Query adris products
      const { data: adrisProducts } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', 'adris');

      // Query petlife products
      const { data: petlifeProducts } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', 'petlife');

      // Verify isolation
      expect(adrisProducts).not.toBeNull();
      expect(petlifeProducts).not.toBeNull();
      expect(adrisProducts!.some((p: { id: string }) => p.id === petlifeProduct!.id)).toBe(false);
      expect(petlifeProducts!.some((p: { id: string }) => p.id === petlifeProduct!.id)).toBe(true);
    });
  });
});
