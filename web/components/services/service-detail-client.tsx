'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DynamicIcon } from '@/lib/icons'
import { MultiPetSelector } from './multi-pet-selector'
import { useCart } from '@/context/cart-context'
import { useServiceCartStatus } from '@/hooks/use-cart-variant-status'
import {
  getServicePriceForSize,
  hasSizeBasedPricing,
  formatPriceGs,
  SIZE_SHORT_LABELS,
  getSizeBadgeColor,
} from '@/lib/utils/pet-size'
import type { Service, ServiceVariant, PetForService } from '@/lib/types/services'

interface ServiceDetailConfig {
  name: string
  contact: {
    whatsapp_number?: string
  }
  ui_labels?: {
    services?: {
      description_label?: string
      includes_label?: string
      table_variant?: string
      table_price?: string
    }
  }
}

/** Minimal service info for navigation */
interface ServiceNavItem {
  id: string
  title: string
  icon?: string
}

interface ServiceDetailClientProps {
  service: Service
  allServices: ServiceNavItem[]
  config: ServiceDetailConfig
  clinic: string
  isLoggedIn: boolean
}

export function ServiceDetailClient({
  service,
  allServices,
  config,
  clinic,
  isLoggedIn,
}: ServiceDetailClientProps) {
  const t = useTranslations('services')
  const { addItem } = useCart()
  const [selectedPets, setSelectedPets] = useState<PetForService[]>([])
  const [addingVariant, setAddingVariant] = useState<string | null>(null)
  const [justAddedVariant, setJustAddedVariant] = useState<string | null>(null)
  const [showPetPrompt, setShowPetPrompt] = useState(false)

  // Track which pets have each variant in cart
  const variantCartStatus = useServiceCartStatus(service.id)

  // Check if any variant has size-based pricing
  const hasSizeDependentVariants = service.variants?.some((v) =>
    hasSizeBasedPricing(v.size_pricing)
  )

  // Get selected pet IDs for the selector
  const selectedPetIds = useMemo(() => selectedPets.map((p) => p.id), [selectedPets])

  // Calculate prices for all variants based on selected pets
  // For multi-pet, we show price breakdown per pet
  const calculatedPrices = useMemo(() => {
    if (!service.variants) return {}

    return service.variants.reduce(
      (acc, variant) => {
        const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing)

        // Calculate per-pet prices
        const petPrices = selectedPets.map((pet) => {
          const price = variantHasSizePricing
            ? (getServicePriceForSize(variant.size_pricing, pet.size_category) ??
              variant.price_value)
            : variant.price_value
          return { petId: pet.id, petName: pet.name, petSize: pet.size_category, price }
        })

        // Total for all selected pets
        const totalPrice = petPrices.reduce((sum, p) => sum + p.price, 0)

        acc[variant.name] = {
          basePrice: variant.price_value,
          petPrices,
          totalPrice,
          isSizeDependent: variantHasSizePricing,
        }
        return acc
      },
      {} as Record<
        string,
        {
          basePrice: number
          petPrices: Array<{ petId: string; petName: string; petSize: string; price: number }>
          totalPrice: number
          isSizeDependent: boolean
        }
      >
    )
  }, [service.variants, selectedPets])

  // State for showing "already in cart" feedback
  const [alreadyInCartMessage, setAlreadyInCartMessage] = useState<string | null>(null)

  // Handle add to cart - adds service for all selected pets (excluding those already in cart)
  const handleAddToCart = async (variant: ServiceVariant) => {
    // Require at least one pet selected
    if (selectedPets.length === 0) {
      setShowPetPrompt(true)
      // Scroll to pet selector on mobile
      const petSelector = document.getElementById('pet-selector-card')
      if (petSelector) {
        petSelector.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Get pets already in cart for this variant
    const cartStatus = variantCartStatus.get(variant.name)
    const petsAlreadyInCart = new Set(cartStatus?.petsInCart || [])

    // Filter to only pets NOT already in cart
    const petsToAdd = selectedPets.filter((pet) => !petsAlreadyInCart.has(pet.id))

    // If all selected pets already have this service, show feedback
    if (petsToAdd.length === 0) {
      const petNames = selectedPets.map((p) => p.name).join(', ')
      setAlreadyInCartMessage(
        selectedPets.length === 1
          ? t('petAlreadyInCartSingular', { name: petNames })
          : t('petAlreadyInCartPlural', { names: petNames })
      )
      setTimeout(() => setAlreadyInCartMessage(null), 3000)
      return
    }

    setAddingVariant(variant.name)
    setShowPetPrompt(false)
    setAlreadyInCartMessage(null)

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing)
    const priceInfo = calculatedPrices[variant.name]

    // Add cart item only for pets that don't already have this service
    for (const pet of petsToAdd) {
      // Get price for this specific pet
      const petPrice = priceInfo?.petPrices.find((p) => p.petId === pet.id)
      const calculatedPrice = petPrice?.price ?? variant.price_value

      addItem({
        id: `${service.id}-${pet.id}-${variant.name}`,
        name: `${service.title} - ${variant.name}`,
        price: calculatedPrice,
        type: 'service',
        image_url: variant.image || service.image,
        description: variant.description || service.summary,
        pet_id: pet.id,
        pet_name: pet.name,
        pet_size: pet.size_category,
        service_id: service.id,
        service_icon: service.icon,
        variant_name: variant.name,
        base_price: variant.price_value,
      })
    }

    // Show feedback if some pets were skipped
    if (petsToAdd.length < selectedPets.length) {
      const skippedPets = selectedPets.filter((p) => petsAlreadyInCart.has(p.id))
      const skippedNames = skippedPets.map((p) => p.name).join(', ')
      setAlreadyInCartMessage(t('petSkippedAlready', { names: skippedNames }))
      setTimeout(() => setAlreadyInCartMessage(null), 3000)
    }

    setAddingVariant(null)
    setJustAddedVariant(variant.name)

    setTimeout(() => {
      setJustAddedVariant(null)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-20">
      {/* HERO HEADER */}
      <div className="relative overflow-hidden pb-6 pt-20 lg:pb-8 lg:pt-28">
        {/* Background - Image or Gradient */}
        {service.image ? (
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${service.image}')` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 z-0"
              style={{ background: 'var(--gradient-primary)' }}
            />
            <div
              className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
          </>
        )}

        <div className="container relative z-10 px-4 md:px-6">
          <Link
            href={`/${clinic}/services`}
            className="mb-8 inline-flex items-center text-sm font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
          >
            <Icons.ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToServices')}
          </Link>

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-lg backdrop-blur-md">
              <DynamicIcon name={service.icon} className="h-12 w-12" />
            </div>
            <div>
              <h1 className="font-heading mb-4 text-balance text-4xl font-black text-white drop-shadow-md md:text-6xl">
                {service.title}
              </h1>
              <p className="max-w-2xl text-xl font-medium leading-relaxed text-white/90">
                {service.summary}
              </p>
            </div>
          </div>

          {/* SERVICE CATEGORY NAVIGATION - Inside hero */}
          {allServices.length > 1 && (
            <div className="mt-10">
              <div className="flex flex-wrap gap-2">
                {allServices.map((s) => (
                  <Link
                    key={s.id}
                    href={`/${clinic}/services/${s.id}`}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                      service.id === s.id
                        ? 'bg-white text-[var(--primary)] shadow-lg'
                        : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
                    }`}
                  >
                    {s.icon && <DynamicIcon name={s.icon} className="h-4 w-4 shrink-0" />}
                    <span>{s.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="container relative z-20 mx-auto grid items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Main Info */}
        <div className="space-y-8 lg:col-span-2">
          {/* Description Card */}
          <div className="rounded-[var(--radius)] border border-gray-100 bg-white p-8 shadow-[var(--shadow-sm)]">
            <h2 className="font-heading mb-4 text-2xl font-bold text-[var(--text-primary)]">
              {config.ui_labels?.services?.description_label || t('serviceDescription')}
            </h2>
            <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
              {service.details?.description}
            </p>

            {service.details?.includes && service.details.includes.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
                  {config.ui_labels?.services?.includes_label || t('whatsIncluded')}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {service.details.includes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg bg-[var(--bg-subtle)] p-3"
                    >
                      <Icons.CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
                      <span className="font-medium text-[var(--text-secondary)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Pricing Table */}
          <div className="overflow-hidden rounded-[var(--radius)] border border-gray-100 bg-white shadow-[var(--shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50 p-6">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                {t('pricingAndVariants')}
              </h2>
              {selectedPets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Icons.PawPrint className="h-4 w-4 text-[var(--primary)]" />
                  {selectedPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-[var(--primary)]/10 flex items-center gap-1.5 rounded-full px-3 py-1.5"
                    >
                      <span className="text-sm font-bold text-[var(--primary)]">{pet.name}</span>
                      {hasSizeDependentVariants && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${getSizeBadgeColor(
                            pet.size_category
                          )}`}
                        >
                          {SIZE_SHORT_LABELS[pet.size_category]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pet selection prompt - shows when user tries to add without pet */}
            {showPetPrompt && selectedPets.length === 0 && (
              <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50 p-4">
                <Icons.AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">
                  {t('selectPetFirst')}
                </p>
              </div>
            )}

            {/* Already in cart feedback - shows when pets already have this service */}
            {alreadyInCartMessage && (
              <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50 p-4">
                <Icons.Info className="h-5 w-5 shrink-0 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">{alreadyInCartMessage}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--bg-subtle)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <tr>
                    <th className="px-6 py-4">
                      {config.ui_labels?.services?.table_variant || t('variant')}
                    </th>
                    <th className="px-6 py-4 text-right">
                      {config.ui_labels?.services?.table_price || t('price')}
                    </th>
                    {isLoggedIn && <th className="w-32 px-6 py-4 text-center">{t('action')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {service.variants?.map((variant, idx) => {
                    const priceInfo = calculatedPrices[variant.name]
                    const isAdding = addingVariant === variant.name
                    const justAdded = justAddedVariant === variant.name
                    const variantHasSizePricing = hasSizeBasedPricing(variant.size_pricing)

                    // Get cart status for this variant
                    const cartStatus = variantCartStatus.get(variant.name)
                    const petsAlreadyInCart = cartStatus?.petNames || []

                    return (
                      <tr key={idx} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {variant.image && (
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                <img
                                  src={variant.image}
                                  alt={variant.name}
                                  className="h-full w-full object-cover p-1"
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-lg font-bold leading-tight text-[var(--text-primary)]">
                                {variant.name}
                              </div>
                              {variant.description && (
                                <div className="mt-1 text-sm text-[var(--text-muted)]">
                                  {variant.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {variantHasSizePricing && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                              <Icons.Calculator className="h-3.5 w-3.5" />
                              <span>{t('priceByPetSize')}</span>
                            </div>
                          )}
                          {/* Show pets already in cart for this variant */}
                          {petsAlreadyInCart.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                              <Icons.CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{t('alreadyInCart', { names: petsAlreadyInCart.join(', ') })}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {/* Show per-pet prices when multiple pets selected */}
                            {selectedPets.length > 0 && priceInfo ? (
                              <>
                                {/* Show individual pet prices for size-dependent variants */}
                                {priceInfo.isSizeDependent && priceInfo.petPrices.length > 1 ? (
                                  <div className="space-y-1">
                                    {priceInfo.petPrices.map((petPrice) => (
                                      <div
                                        key={petPrice.petId}
                                        className="flex items-center justify-end gap-2"
                                      >
                                        <span className="text-xs text-[var(--text-muted)]">
                                          {petPrice.petName}:
                                        </span>
                                        <span className="text-sm font-bold text-[var(--primary)]">
                                          {formatPriceGs(petPrice.price)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="mt-1 border-t border-gray-200 pt-1">
                                      <span className="inline-block rounded-full bg-[var(--primary)] px-3 py-1 text-sm font-black text-white">
                                        {t('total')}: {formatPriceGs(priceInfo.totalPrice)}
                                      </span>
                                    </div>
                                  </div>
                                ) : priceInfo.petPrices.length === 1 ? (
                                  /* Single pet selected */
                                  <span className="inline-block rounded-full bg-[var(--primary)] px-3 py-1 font-black text-white">
                                    {formatPriceGs(priceInfo.petPrices[0].price)}
                                  </span>
                                ) : (
                                  /* Multiple pets, flat pricing */
                                  <span className="inline-block rounded-full bg-[var(--primary)] px-3 py-1 font-black text-white">
                                    {formatPriceGs(priceInfo.totalPrice)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="inline-block rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-black text-[var(--primary)]">
                                {variant.price_display}
                              </span>
                            )}
                          </div>
                        </td>
                        {isLoggedIn && (
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-2">
                              {variant.price_value > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(variant)}
                                  disabled={isAdding || justAdded || selectedPets.length === 0}
                                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                    justAdded
                                      ? 'bg-green-500 text-white'
                                      : selectedPets.length === 0
                                        ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                        : 'bg-[var(--primary)] text-white hover:brightness-110'
                                  } disabled:opacity-70`}
                                  title={
                                    selectedPets.length === 0
                                      ? t('selectPetToAdd')
                                      : t('addToCart')
                                  }
                                >
                                  {isAdding ? (
                                    <>
                                      <Icons.Loader2 className="h-4 w-4 animate-spin" />
                                      <span className="hidden sm:inline">{t('adding')}</span>
                                    </>
                                  ) : justAdded ? (
                                    <>
                                      <Icons.Check className="h-4 w-4" />
                                      <span className="hidden sm:inline">{t('added')}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Icons.ShoppingBag className="h-4 w-4" />
                                      <span className="hidden sm:inline">
                                        {selectedPets.length > 1
                                          ? t('addForCount', { count: selectedPets.length })
                                          : t('add')}
                                      </span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-sm text-[var(--text-muted)]">{t('priceOnRequest')}</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Pet Selector Card - Always show for logged in users */}
          {isLoggedIn && (
            <div
              id="pet-selector-card"
              className={`rounded-[var(--radius)] border bg-white p-6 shadow-[var(--shadow-sm)] transition-all ${
                showPetPrompt && selectedPets.length === 0
                  ? 'border-amber-400 ring-2 ring-amber-200'
                  : 'border-gray-100'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <Icons.PawPrint className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                  {t('selectYourPets')}
                </h3>
              </div>
              <p className="mb-4 text-sm text-[var(--text-muted)]">
                {hasSizeDependentVariants
                  ? t('selectPetsHelperSizeDependent')
                  : t('selectPetsHelper')}
              </p>
              <MultiPetSelector
                onSelectionChange={(pets) => {
                  setSelectedPets(pets)
                  setShowPetPrompt(false)
                }}
                selectedPetIds={selectedPetIds}
              />
            </div>
          )}

          {/* Booking Card */}
          <div className="sticky top-6 rounded-[var(--radius)] border border-gray-100 bg-white p-6 shadow-[var(--shadow-md)]">
            <h3 className="font-heading mb-2 text-xl font-bold text-[var(--text-primary)]">
              {t('bookYourAppointment')}
            </h3>
            <p className="mb-6 text-sm text-[var(--text-secondary)]">
              {t('bookOnlineDescription', { service: service.title })}
            </p>

            {service.booking?.online_enabled && (
              <Link
                href={`/${clinic}/book?service=${service.id}`}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:brightness-110"
              >
                <Icons.Calendar className="h-5 w-5" />
                {t('bookOnline')}
              </Link>
            )}

            {config.contact.whatsapp_number && (
              <a
                href={`https://wa.me/${config.contact.whatsapp_number}?text=${encodeURIComponent(
                  t('whatsappTemplate', { service: service.title })
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold transition-transform hover:-translate-y-1 ${
                  service.booking?.online_enabled
                    ? 'border-2 border-[#25D366] bg-white text-[#25D366] hover:bg-green-50'
                    : 'bg-[#25D366] text-white shadow-lg hover:brightness-110'
                }`}
              >
                <Icons.MessageCircle className="h-5 w-5" />
                {t('contactWhatsApp')}
              </a>
            )}

            {/* Cart Link if logged in */}
            {isLoggedIn && (
              <Link
                href={`/${clinic}/cart`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-[var(--bg-subtle)] px-6 py-3 font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-default)]"
              >
                <Icons.ShoppingCart className="h-5 w-5" />
                {t('viewCart')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
