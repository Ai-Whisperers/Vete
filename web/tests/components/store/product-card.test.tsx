/**
 * ProductCard Component Tests
 *
 * Tests the product card component including:
 * - Render with product data
 * - Variant display (minimal vs full)
 * - Price formatting
 * - Stock status display
 * - Wishlist functionality
 * - Add to cart functionality
 * - Quick view button
 * - Product badges
 *
 * @ticket TEST-002
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockProduct } from '@/lib/test-utils/component-test-helpers'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    onMouseEnter,
    onMouseLeave,
  }: {
    children: React.ReactNode
    href: string
    className?: string
    onMouseEnter?: () => void
    onMouseLeave?: () => void
  }) => (
    <a
      href={href}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </a>
  ),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    className,
    sizes,
  }: {
    src: string
    alt: string
    fill?: boolean
    className?: string
    sizes?: string
  }) => (
    <img src={src} alt={alt} className={className} data-fill={fill} data-sizes={sizes} />
  ),
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Heart: ({ className }: { className?: string }) => <span data-testid="icon-heart" className={className} />,
  ShoppingCart: () => <span data-testid="icon-cart" />,
  Star: ({ className }: { className?: string }) => <span data-testid="icon-star" className={className} />,
  Eye: () => <span data-testid="icon-eye" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Trophy: () => <span data-testid="icon-trophy" />,
  Percent: () => <span data-testid="icon-percent" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Check: () => <span data-testid="icon-check" />,
  Truck: () => <span data-testid="icon-truck" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  ImageIcon: () => <span data-testid="icon-image" />,
}))

// Mock cart context
const mockAddItem = vi.fn().mockReturnValue({ success: true, limitedByStock: false })
vi.mock('@/context/cart-context', () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}))

// Mock wishlist context
const mockIsWishlisted = vi.fn().mockReturnValue(false)
const mockToggleWishlist = vi.fn()
vi.mock('@/context/wishlist-context', () => ({
  useWishlist: () => ({
    isWishlisted: mockIsWishlisted,
    toggleWishlist: mockToggleWishlist,
  }),
}))

// Mock NotifyWhenAvailable
vi.mock('./notify-when-available', () => ({
  NotifyWhenAvailable: ({ productId, variant }: { productId: string; clinic: string; variant: string }) => (
    <div data-testid="notify-available" data-product={productId} data-variant={variant}>
      Notificar cuando esté disponible
    </div>
  ),
}))

import { ProductCard } from '@/components/store/product-card'

describe('ProductCard', () => {
  const defaultProduct = createMockProduct()
  const defaultProps = {
    product: defaultProduct,
    clinic: 'adris',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsWishlisted.mockReturnValue(false)
    mockAddItem.mockReturnValue({ success: true, limitedByStock: false })
  })

  describe('Rendering', () => {
    it('renders product name', () => {
      render(<ProductCard {...defaultProps} />)

      expect(screen.getByText(defaultProduct.name)).toBeInTheDocument()
    })

    it('renders product image when available', () => {
      const product = createMockProduct({ image_url: 'https://example.com/product.jpg' })
      render(<ProductCard product={product} clinic="adris" />)

      const img = screen.getByAltText(product.name)
      expect(img).toHaveAttribute('src', 'https://example.com/product.jpg')
    })

    it('renders placeholder icon when no image', () => {
      const product = createMockProduct({ image_url: null })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByTestId('icon-image')).toBeInTheDocument()
    })

    it('renders product link with correct href', () => {
      render(<ProductCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', `/adris/store/product/${defaultProduct.id}`)
    })
  })

  describe('Price Display', () => {
    it('formats current price in Guarani', () => {
      const product = createMockProduct({ current_price: 150000 })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/gs 150\.000/i)).toBeInTheDocument()
    })

    it('shows original price when discounted', () => {
      const product = createMockProduct({
        current_price: 50000,
        original_price: 60000,
        has_discount: true,
      })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/gs 50\.000/i)).toBeInTheDocument()
      expect(screen.getByText(/gs 60\.000/i)).toBeInTheDocument()
    })

    it('handles zero price', () => {
      const product = createMockProduct({ current_price: 0 })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/gs 0/i)).toBeInTheDocument()
    })
  })

  describe('Product Badges', () => {
    it('shows discount badge when product has discount', () => {
      const product = createMockProduct({
        has_discount: true,
        discount_percentage: 20,
      })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/-20%/)).toBeInTheDocument()
    })

    it('shows new arrival badge', () => {
      const product = createMockProduct({ is_new_arrival: true })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/nuevo/i)).toBeInTheDocument()
    })

    it('shows best seller badge', () => {
      const product = createMockProduct({ is_best_seller: true })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/top/i)).toBeInTheDocument()
    })

    it('shows multiple badges', () => {
      const product = createMockProduct({
        has_discount: true,
        discount_percentage: 15,
        is_new_arrival: true,
        is_best_seller: true,
      })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/-15%/)).toBeInTheDocument()
      expect(screen.getByText(/nuevo/i)).toBeInTheDocument()
      expect(screen.getByText(/top/i)).toBeInTheDocument()
    })
  })

  describe('Stock Status', () => {
    it('shows shipping available for in-stock products', () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.getByText(/envío disponible/i)).toBeInTheDocument()
    })

    it('shows low stock warning', () => {
      const product = createMockProduct({ stock_quantity: 3 })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.getByText(/últimos 3/i)).toBeInTheDocument()
    })

    it('shows out of stock overlay', () => {
      const product = createMockProduct({ stock_quantity: 0 })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/sin stock/i)).toBeInTheDocument()
    })

    it('shows notify button for out-of-stock products', () => {
      const product = createMockProduct({ stock_quantity: 0 })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByTestId('notify-available')).toBeInTheDocument()
    })
  })

  describe('Ratings Display', () => {
    it('shows rating stars when product has reviews', () => {
      const product = createMockProduct({
        avg_rating: 4.5,
        review_count: 12,
      })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.getByText(/4\.5/)).toBeInTheDocument()
      expect(screen.getByText(/\(12\)/)).toBeInTheDocument()
    })

    it('does not show ratings when no reviews', () => {
      const product = createMockProduct({
        avg_rating: 0,
        review_count: 0,
      })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.queryByText(/\(0\)/)).not.toBeInTheDocument()
    })

    it('hides ratings in minimal variant', () => {
      const product = createMockProduct({
        avg_rating: 4.5,
        review_count: 12,
      })
      render(<ProductCard product={product} clinic="adris" variant="minimal" showRatings={false} />)

      expect(screen.queryByText(/4\.5/)).not.toBeInTheDocument()
    })
  })

  describe('Brand Display', () => {
    it('shows brand name in full variant', () => {
      const product = createMockProduct({
        brand: { id: 'b1', name: 'Premium Pet' },
      })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.getByText('Premium Pet')).toBeInTheDocument()
    })

    it('hides brand in minimal variant by default', () => {
      const product = createMockProduct({
        brand: { id: 'b1', name: 'Premium Pet' },
      })
      render(<ProductCard product={product} clinic="adris" variant="minimal" />)

      expect(screen.queryByText('Premium Pet')).not.toBeInTheDocument()
    })
  })

  describe('Wishlist Functionality', () => {
    it('shows wishlist button in full variant', () => {
      render(<ProductCard {...defaultProps} variant="full" />)

      expect(screen.getByLabelText(/agregar a lista de deseos/i)).toBeInTheDocument()
    })

    it('hides wishlist button in minimal variant', () => {
      render(<ProductCard {...defaultProps} variant="minimal" />)

      expect(screen.queryByLabelText(/agregar a lista de deseos/i)).not.toBeInTheDocument()
    })

    it('calls toggleWishlist when clicked', async () => {
      render(<ProductCard {...defaultProps} variant="full" />)

      const wishlistButton = screen.getByLabelText(/agregar a lista de deseos/i)
      fireEvent.click(wishlistButton)

      await waitFor(() => {
        expect(mockToggleWishlist).toHaveBeenCalledWith(defaultProduct.id)
      })
    })

    it('shows filled heart when wishlisted', () => {
      mockIsWishlisted.mockReturnValue(true)
      render(<ProductCard {...defaultProps} variant="full" />)

      expect(screen.getByLabelText(/quitar de lista de deseos/i)).toBeInTheDocument()
    })
  })

  describe('Add to Cart', () => {
    it('shows add to cart button for in-stock products', () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" />)

      expect(screen.getByText(/agregar al carrito/i)).toBeInTheDocument()
    })

    it('calls addItem when clicked', async () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" />)

      const addButton = screen.getByText(/agregar al carrito/i)
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalled()
      })
    })

    it('shows confirmation after adding', async () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" />)

      const addButton = screen.getByText(/agregar al carrito/i)
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/agregado/i)).toBeInTheDocument()
      })
    })

    it('disables button while adding', async () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" />)

      const addButton = screen.getByText(/agregar al carrito/i)
      fireEvent.click(addButton)

      // Button should show loading state
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument()
    })
  })

  describe('Quick View', () => {
    it('shows quick view button when onQuickView provided', () => {
      const mockQuickView = vi.fn()
      const product = createMockProduct({ stock_quantity: 10 })
      const { container } = render(
        <ProductCard product={product} clinic="adris" onQuickView={mockQuickView} />
      )

      // Trigger hover
      const link = container.querySelector('a')!
      fireEvent.mouseEnter(link)

      expect(screen.getByText(/vista rápida/i)).toBeInTheDocument()
    })

    it('calls onQuickView when clicked', () => {
      const mockQuickView = vi.fn()
      const product = createMockProduct({ stock_quantity: 10 })
      const { container } = render(
        <ProductCard product={product} clinic="adris" onQuickView={mockQuickView} />
      )

      // Trigger hover
      const link = container.querySelector('a')!
      fireEvent.mouseEnter(link)

      const quickViewButton = screen.getByText(/vista rápida/i)
      fireEvent.click(quickViewButton)

      expect(mockQuickView).toHaveBeenCalledWith(product)
    })

    it('hides quick view for out-of-stock products', () => {
      const mockQuickView = vi.fn()
      const product = createMockProduct({ stock_quantity: 0 })
      const { container } = render(
        <ProductCard product={product} clinic="adris" onQuickView={mockQuickView} />
      )

      // Trigger hover
      const link = container.querySelector('a')!
      fireEvent.mouseEnter(link)

      expect(screen.queryByText(/vista rápida/i)).not.toBeInTheDocument()
    })
  })

  describe('Variant Differences', () => {
    it('shows shorter button text in minimal variant', () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" variant="minimal" />)

      expect(screen.getByText(/agregar$/i)).toBeInTheDocument()
    })

    it('shows description in minimal variant', () => {
      const product = createMockProduct({
        stock_quantity: 10,
        short_description: 'Alimento premium para perros',
      })
      render(<ProductCard product={product} clinic="adris" variant="minimal" />)

      expect(screen.getByText('Alimento premium para perros')).toBeInTheDocument()
    })

    it('shows quantity selector in minimal variant', () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" variant="minimal" />)

      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('shows category badge in minimal variant', () => {
      const product = createMockProduct({
        stock_quantity: 10,
        category: { id: 'c1', name: 'Alimentos', slug: 'alimentos' },
      })
      render(<ProductCard product={product} clinic="adris" variant="minimal" />)

      expect(screen.getByText('Alimentos')).toBeInTheDocument()
    })
  })

  describe('Loyalty Points', () => {
    it('shows loyalty points for eligible products', () => {
      const product = createMockProduct({
        current_price: 50000,
        stock_quantity: 10,
      })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      // 50000 / 10000 = 5 points
      expect(screen.getByText(/gana 5 puntos/i)).toBeInTheDocument()
    })

    it('does not show loyalty points for low-price products', () => {
      const product = createMockProduct({
        current_price: 5000,
        stock_quantity: 10,
      })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.queryByText(/gana.*puntos/i)).not.toBeInTheDocument()
    })

    it('does not show loyalty points for out-of-stock', () => {
      const product = createMockProduct({
        current_price: 50000,
        stock_quantity: 0,
      })
      render(<ProductCard product={product} clinic="adris" variant="full" />)

      expect(screen.queryByText(/gana.*puntos/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible wishlist button', () => {
      render(<ProductCard {...defaultProps} variant="full" />)

      const button = screen.getByRole('button', { name: /lista de deseos/i })
      expect(button).toBeInTheDocument()
    })

    it('has accessible add to cart button', () => {
      const product = createMockProduct({ stock_quantity: 10 })
      render(<ProductCard product={product} clinic="adris" />)

      const button = screen.getByRole('button', { name: /agregar/i })
      expect(button).toBeInTheDocument()
    })
  })
})
