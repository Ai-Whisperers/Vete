/**
 * Comprehensive TypeScript type definitions for clinic configuration
 * Generated from actual JSON structure in .content_data/
 */

// ============================================================================
// UI Labels Types
// ============================================================================

export interface NavLabels {
  home: string
  services: string
  about: string
  store: string
  book: string
  contact: string
  owners_zone: string
  login_profile: string
  dashboard: string
  profile: string
  my_pets: string
  back: string
  book_btn: string
  emergency_btn: string
  // Additional nav labels for mobile menu
  faq?: string
  loyalty_program?: string
  menu?: string
  navigation?: string
  tools?: string
  my_account?: string
  login?: string
  settings?: string
}

export interface FooterLabels {
  rights: string
  privacy: string
  terms: string
  contact_us: string
  follow_us: string
  newsletter_title: string
  newsletter_placeholder: string
  newsletter_button: string
}

export interface HomeLabels {
  visit_us: string
  features_title: string
  features_subtitle: string
  tools_badge: string
  contact_badge: string
  map_button: string
  hours_title: string
  emergency_title: string
  emergency_text: string
  emergency_cta: string
}

export interface VaccineScheduleData {
  age: string
  n: number
  vaccines: string[]
  note: string
}

export interface VaccineSchedule {
  title: string
  subtitle: string
  dog_label: string
  cat_label: string
  important_label: string
  important_text: string
  data: {
    dog: VaccineScheduleData[]
    cat: VaccineScheduleData[]
  }
}

export interface ServicesLabels {
  meta_title: string
  meta_subtitle: string
  online_badge: string
  emergency_badge: string
  description_label: string
  includes_label: string
  duration_label: string
  table_variant: string
  table_price: string
  book_floating_btn: string
  filter_all: string
  filter_medical: string
  filter_surgery: string
  filter_diagnostics: string
  filter_wellness: string
  filter_grooming: string
  view_details: string
  book_now: string
  contact_for_price: string
  vaccine_schedule: VaccineSchedule
}

export interface AboutLabels {
  team_title: string
  intro_badge: string
  mission_title: string
  vision_title: string
  values_title: string
  certifications_title: string
  facilities_title: string
}

export interface PortalDashboardStats {
  patients: string
  vaccines: string
  upcoming_appointments: string
  loyalty_points: string
}

export interface PortalDashboard {
  staff_title: string
  owner_title: string
  welcome: string
  quick_actions: string
  recent_activity: string
  stats: PortalDashboardStats
}

export interface PortalEmptyStates {
  no_pets: string
  no_pets_desc: string
  add_pet_btn: string
  no_vaccines: string
  no_appointments: string
  no_records: string
}

export interface PortalPetCard {
  weight: string
  chip: string
  age: string
  breed: string
  vaccines: string
  next_vaccine: string
  add_vaccine: string
  view_history: string
  download_pdf: string
  edit_pet: string
  qr_code: string
}

/**
 * UI labels for appointment status display
 * All properties are optional to allow partial translations
 */
export interface AppointmentStatusLabels {
  scheduled?: string
  confirmed?: string
  checked_in?: string
  in_progress?: string
  completed?: string
  cancelled?: string
  no_show?: string
  /** @deprecated Use 'scheduled' instead */
  pending?: string
}

export interface PortalAppointmentWidget {
  title: string
  empty: string
  new_appointment: string
  status: AppointmentStatusLabels
}

export interface PortalForms {
  pet_name: string
  pet_species: string
  pet_breed: string
  pet_birthdate: string
  pet_weight: string
  pet_color: string
  pet_gender: string
  pet_neutered: string
  pet_microchip: string
  species_dog: string
  species_cat: string
  species_bird: string
  species_rabbit: string
  species_other: string
  gender_male: string
  gender_female: string
  yes: string
  no: string
}

export interface PortalLabels {
  dashboard: PortalDashboard
  empty_states: PortalEmptyStates
  pet_card: PortalPetCard
  appointment_widget: PortalAppointmentWidget
  forms: PortalForms
}

export interface ProductCardLabels {
  add: string
  added: string
  out_of_stock: string
  view_details: string
}

export interface StoreCategories {
  all: string
  food: string
  medicine: string
  accessories: string
  hygiene: string
  toys: string
}

export interface StoreLabels {
  title: string
  back_home: string
  hero_title: string
  hero_subtitle: string
  search_placeholder: string
  all_categories: string
  empty_state: string
  no_results: string
  sort_by: string
  sort_popular: string
  sort_price_low: string
  sort_price_high: string
  sort_newest: string
  product_card: ProductCardLabels
  categories: StoreCategories
}

export interface CartLabels {
  title: string
  empty: string
  empty_cta: string
  item_service: string
  item_product: string
  quantity: string
  unit_price: string
  subtotal: string
  clear_btn: string
  total_label: string
  continue_shopping: string
  checkout_btn: string
  delivery_note: string
}

export interface CheckoutLabels {
  title: string
  empty: string
  customer_info: string
  delivery_info: string
  payment_method: string
  order_summary: string
  print_btn: string
  whatsapp_btn: string
  back_cart: string
  order_notes: string
  order_notes_placeholder: string
}

export interface BookingLabels {
  title: string
  select_service: string
  select_date: string
  select_time: string
  select_pet: string
  your_info: string
  confirm_btn: string
  success_title: string
  success_message: string
  available_slots: string
  no_slots: string
}

export interface CommonActions {
  save: string
  cancel: string
  edit: string
  delete: string
  confirm: string
  close: string
  back: string
  next: string
  submit: string
  search: string
  filter: string
  clear: string
  download: string
  share: string
  copy: string
}

export interface CommonValidation {
  required: string
  invalid_email: string
  invalid_phone: string
  min_length: string
  max_length: string
}

export interface CommonLabels {
  loading: string
  error: string
  retry: string
  actions: CommonActions
  validation: CommonValidation
}

export interface AuthLabels {
  login_title: string
  signup_title: string
  email_label: string
  password_label: string
  confirm_password: string
  forgot_password: string
  login_btn: string
  signup_btn: string
  or_divider: string
  google_btn: string
  no_account: string
  has_account: string
  logout: string
}

export interface ToxicFoodLabels {
  title: string
  subtitle: string
  search_placeholder: string
  safe: string
  toxic: string
  caution: string
  disclaimer: string
}

export interface AgeCalculatorLabels {
  title: string
  subtitle: string
  pet_age_label: string
  pet_size_label: string
  size_small: string
  size_medium: string
  size_large: string
  result_prefix: string
  result_suffix: string
}

export interface ToolsLabels {
  toxic_food: ToxicFoodLabels
  age_calculator: AgeCalculatorLabels
}

export interface ErrorLabels {
  '404_title': string
  '404_message': string
  '500_title': string
  '500_message': string
  go_home: string
}

// ============================================================================
// Dashboard Labels Types (Vet/Admin)
// ============================================================================

export interface DashboardSidebarLabels {
  agenda: string
  dashboard: string
  calendar: string
  appointments_today: string
  vaccines: string
  hospital: string
  laboratory: string
  clients: string
  directory: string
  messages: string
  consents: string
  finances: string
  analytics: string
  invoices: string
  inventory: string
  insurance: string
  settings: string
  team: string
  schedules: string
  time_off: string
  audit: string
  tools: string
  back_to_portal: string
}

export interface DashboardAnalyticsLabels {
  title: string
  subtitle: string
  period: {
    week: string
    month: string
    quarter: string
  }
  stats: {
    revenue: string
    appointments: string
    new_clients: string
    new_pets: string
    vs_previous: string
  }
  charts: {
    revenue_by_day: string
    appointments_by_type: string
    top_services: string
  }
  quick_stats: {
    satisfaction: string
    wait_time: string
    retention: string
    low_stock: string
  }
}

export interface DashboardClientLabels {
  title: string
  search_placeholder: string
  export_csv: string
  new_client: string
  bulk_message: string
  filters: {
    all: string
    vip: string
    recent: string
    inactive: string
    criadero: string
    rescate: string
  }
  detail: {
    contact_info: string
    financial_summary: string
    outstanding_balance: string
    total_invoices: string
    registered_pets: string
    internal_notes: string
    add_note: string
    pets: string
    add_pet: string
    appointment_history: string
    invoice_history: string
    communication_history: string
    new_appointment: string
    view_invoices: string
    send_message: string
  }
}

export interface DashboardTagLabels {
  vip: string
  criadero: string
  rescate: string
  nuevo: string
  frecuente: string
  moroso: string
  empleado: string
  referido: string
  add: string
  select_tag: string
  all_assigned: string
}

export interface DashboardLoyaltyLabels {
  title: string
  current_balance: string
  lifetime_earned: string
  next_level: string
  add: string
  redeem: string
  points: string
  levels: {
    bronze: string
    silver: string
    gold: string
    platinum: string
  }
  transaction_history: string
  points_added: string
  points_redeemed: string
  confirm: string
}

export interface DashboardNotesLabels {
  title: string
  add: string
  placeholder: string
  private: string
  public: string
  no_notes: string
  add_first: string
}

export interface DashboardSearchLabels {
  placeholder: string
  no_results: string
  try_other: string
  recent: string
  types: {
    client: string
    pet: string
    appointment: string
    invoice: string
    product: string
  }
}

export interface DashboardShortcutsLabels {
  title: string
  subtitle: string
  categories: {
    general: string
    search: string
    calendar: string
    clients: string
    quick_actions: string
    other: string
  }
  press_to_show: string
}

export interface DashboardBulkMessagingLabels {
  title: string
  steps: {
    select: string
    compose: string
    review: string
    sending: string
  }
  channel: string
  channels: {
    whatsapp: string
    email: string
    sms: string
  }
  template: string
  templates: {
    reminder: string
    promo: string
    checkup: string
    custom: string
  }
  message: string
  variables_hint: string
  selected_count: string
  select_all: string
  clear: string
  continue_with: string
  confirm_send: string
  send_warning: string
  send: string
  completed: string
  sent_count: string
  failed_count: string
}

export interface DashboardInventoryLabels {
  title: string
  search_placeholder: string
  scan_barcode: string
  export: string
  filters: {
    all: string
    in_stock: string
    low_stock: string
    out_of_stock: string
  }
  barcode_scanner: {
    title: string
    searching: string
    not_found: string
    use_code: string
    scan_another: string
    manual_entry: string
    stock_available: string
    price: string
  }
}

export interface DashboardPatientActionsLabels {
  title: string
  frequent: string
  more: string
  actions: {
    new_appointment: string
    medical_history: string
    vaccine: string
    prescription: string
    lab: string
    hospitalize: string
    quality_of_life: string
    quick_consult: string
    consent: string
    photo_doc: string
    message_owner: string
  }
}

export interface DashboardWaitingRoomLabels {
  title: string
  refresh: string
  check_in: string
  start_consult: string
  complete: string
  no_show: string
  waiting_time: string
  statuses: {
    pending: string
    confirmed: string
    checked_in: string
    in_progress: string
    completed: string
    cancelled: string
    no_show: string
  }
}

export interface DashboardSettingsLabels {
  title: string
  sections: {
    general: string
    branding: string
    modules: string
    services: string
  }
  general: {
    clinic_name: string
    description: string
    contact: string
    phone: string
    email: string
    address: string
    hours: string
  }
  branding: {
    colors: string
    logo: string
    favicon: string
  }
  modules: {
    enable_disable: string
    clinical: string
    features: string
    commerce: string
  }
}

export interface DashboardExportLabels {
  title: string
  fields_to_export: string
  select_all: string
  none: string
  download: string
  exporting: string
  exported: string
  fields_selected: string
}

export interface DashboardCommonLabels {
  loading: string
  error: string
  retry: string
  save: string
  cancel: string
  edit: string
  delete: string
  confirm: string
  close: string
  back: string
  next: string
  search: string
  filter: string
  export: string
  import: string
  view_details: string
  not_registered: string
  units: string
}

export interface DashboardLabels {
  sidebar: DashboardSidebarLabels
  analytics: DashboardAnalyticsLabels
  clients: DashboardClientLabels
  tags: DashboardTagLabels
  loyalty: DashboardLoyaltyLabels
  notes: DashboardNotesLabels
  search: DashboardSearchLabels
  shortcuts: DashboardShortcutsLabels
  bulk_messaging: DashboardBulkMessagingLabels
  inventory: DashboardInventoryLabels
  patient_actions: DashboardPatientActionsLabels
  waiting_room: DashboardWaitingRoomLabels
  settings: DashboardSettingsLabels
  export: DashboardExportLabels
  common: DashboardCommonLabels
}

export interface UiLabels {
  nav: NavLabels
  footer: FooterLabels
  home: HomeLabels
  services: ServicesLabels
  about: AboutLabels
  portal: PortalLabels
  store: StoreLabels
  cart: CartLabels
  checkout: CheckoutLabels
  booking: BookingLabels
  common: CommonLabels
  auth: AuthLabels
  tools: ToolsLabels
  errors: ErrorLabels
  dashboard?: DashboardLabels
}

// ============================================================================
// Config Types
// ============================================================================

export interface ContactInfo {
  whatsapp_number: string
  phone_display: string
  email: string
  address: string
  city?: string
  country?: string
  google_maps_id: string
  coordinates?: {
    lat: number
    lng: number
  }
  /** Emergency phone number (24h) */
  emergencyPhone?: string
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
}

export interface HoursInfo {
  weekdays?: string
  saturday?: string
  sunday?: string
  holidays?: string
}

export interface ModuleSettings {
  toxic_checker: boolean
  age_calculator: boolean
  growth_charts?: boolean
  vaccine_tracker?: boolean
  qr_tags?: boolean
  loyalty_program?: boolean
  online_store?: boolean
  booking?: boolean
  telemedicine?: boolean
}

export interface ClinicSettings {
  currency: string
  currency_symbol?: string
  locale?: string
  timezone?: string
  emergency_24h: boolean
  accepts_insurance?: boolean
  insurance_providers?: string[]
  delivery_enabled?: boolean
  delivery_minimum?: number
  delivery_zones?: string[]
  modules: ModuleSettings
  /** Google Sheets template URL for inventory import (format: https://docs.google.com/spreadsheets/d/{ID}/copy) */
  inventory_template_google_sheet_url?: string | null
}

export interface BrandingAssets {
  logo_url?: string
  logo_dark_url?: string
  logo_width?: number
  logo_height?: number
  favicon_url?: string
  hero_image_url?: string
  og_image_url?: string
  apple_touch_icon?: string
}

export interface StatsInfo {
  pets_served?: string
  years_experience?: string
  emergency_hours?: string
  rating?: string
}

export interface ClinicConfig {
  id: string
  name: string
  tagline?: string
  contact: ContactInfo
  social?: SocialLinks
  hours?: HoursInfo
  settings: ClinicSettings
  ui_labels: UiLabels
  branding?: BrandingAssets
  stats?: StatsInfo
  /** Module toggles (shortcut, also available in settings.modules) */
  modules?: {
    toxicFoodChecker?: boolean
    ageCalculator?: boolean
    [key: string]: boolean | undefined
  }
}

// ============================================================================
// Home Page Data Types
// ============================================================================

export interface TrustBadge {
  icon: string
  text: string
}

export interface HeroSection {
  badge_text: string
  headline: string
  subhead: string
  cta_primary: string
  cta_secondary: string
  trust_badges: TrustBadge[]
}

export interface FeatureItem {
  icon: string
  title: string
  text: string
}

export interface PromoBanner {
  enabled: boolean
  text: string
  link: string
  expires: string
}

export interface StatItem {
  value: string
  label: string
}

export interface StatsSection {
  enabled: boolean
  title: string
  stats: StatItem[]
}

export interface InteractiveTool {
  id: string
  icon: string
  title: string
  description: string
  color: string
}

export interface InteractiveToolsSection {
  enabled: boolean
  title: string
  subtitle: string
  toxic_food_cta: string
  age_calc_cta: string
  tools: InteractiveTool[]
}

export interface ServicesPreview {
  enabled: boolean
  title: string
  subtitle: string
  featured_services: string[]
  cta_text: string
}

export interface TestimonialsSection {
  enabled: boolean
  title: string
  subtitle: string
  show_count: number
}

export interface BrandLogo {
  name: string
  image: string
}

export interface PartnersSection {
  enabled: boolean
  title: string
  logos: BrandLogo[]
}

export interface CtaSection {
  enabled: boolean
  title: string
  subtitle: string
  primary_cta: string
  secondary_cta: string
}

export interface SeoMetadata {
  meta_title: string
  meta_description: string
  keywords: string[]
  og_type: string
  og_locale: string
}

export interface HomeData {
  hero: HeroSection
  features: FeatureItem[]
  promo_banner: PromoBanner
  stats_section: StatsSection
  interactive_tools_section: InteractiveToolsSection
  services_preview: ServicesPreview
  testimonials_section: TestimonialsSection
  partners_section: PartnersSection
  cta_section: CtaSection
  seo: SeoMetadata
}

// ============================================================================
// Services Data Types
// ============================================================================

export interface ServiceVariant {
  name: string
  description?: string
  price_display: string
  price_value: number
  image?: string
  size_pricing?: any
}

export interface ServiceDetails {
  description: string
  duration_minutes: number
  includes: string[]
}

export interface ServiceBooking {
  online_enabled: boolean
  emergency_available: boolean
}

export interface Service {
  id: string
  visible: boolean
  category: string
  title: string
  icon: string
  summary: string
  image: string
  details: ServiceDetails
  variants: ServiceVariant[]
  booking: ServiceBooking
}

export interface ServicesMeta {
  title: string
  subtitle: string
}

export interface ServicesData {
  meta: ServicesMeta
  services: Service[]
}

// ============================================================================
// About Page Data Types
// ============================================================================

export interface AboutIntro {
  title: string
  text: string
  founded_year: number
  image: string
}

export interface MissionVision {
  title: string
  text: string
}

export interface ValueItem {
  icon: string
  title: string
  text: string
}

export interface TeamMember {
  name: string
  role: string
  image: string
  bio: string
  specialties: string[]
  education: string[]
}

export interface FacilityFeature {
  icon: string
  title: string
  text: string
}

export interface FacilitiesInfo {
  title: string
  description: string
  features: FacilityFeature[]
  images: string[]
}

export interface Certification {
  name: string
  description: string
  logo: string
}

export interface TimelineEvent {
  year: string
  event: string
}

export interface AboutData {
  intro: AboutIntro
  mission: MissionVision
  vision: MissionVision
  values: ValueItem[]
  team: TeamMember[]
  facilities: FacilitiesInfo
  certifications: Certification[]
  timeline: TimelineEvent[]
}

// ============================================================================
// Testimonials Data Types
// ============================================================================

export interface Testimonial {
  id: number
  author: string
  pet_name: string
  pet_type: string
  rating: number
  pet_image: string
  text: string
  date: string
  source: string
  verified: boolean
  service_used: string
}

export type TestimonialsData = Testimonial[]

// ============================================================================
// FAQ Data Types
// ============================================================================

export interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
}

export type FaqData = FaqItem[]

// ============================================================================
// Legal Data Types
// ============================================================================

export interface LegalSection {
  title: string
  content: string
}

export interface PrivacyPolicy {
  title: string
  last_updated: string
  sections: LegalSection[]
}

export interface TermsOfService {
  title: string
  last_updated: string
  sections: LegalSection[]
}

export interface CookiePolicy {
  title: string
  last_updated: string
  content: string
}

export interface LegalData {
  privacy_policy: PrivacyPolicy
  terms_of_service: TermsOfService
  cookie_policy: CookiePolicy
}

// ============================================================================
// Theme Types - Comprehensive Design System
// ============================================================================

/** Color scale from 50 (lightest) to 900 (darkest) plus RGB for opacity variants */
export interface ColorScale {
  main: string
  light: string
  dark: string
  contrast: string
  '50'?: string
  '100'?: string
  '200'?: string
  '300'?: string
  '400'?: string
  '500'?: string
  '600'?: string
  '700'?: string
  '800'?: string
  '900'?: string
  '950'?: string
  rgb?: string // e.g., "47, 82, 51" for rgba() usage
}

/** Status color with full semantic variants */
export interface StatusColorSet {
  main: string
  light?: string
  dark?: string
  bg?: string
  border?: string
}

/** Full status color palette */
export interface StatusColors {
  success: string | StatusColorSet
  warning: string | StatusColorSet
  error: string | StatusColorSet
  info: string | StatusColorSet
}

/** Background color variants */
export interface BackgroundColors {
  default: string
  paper: string
  subtle: string
  dark: string
  hero?: string
  // Surface elevations
  surface?: string
  surfaceElevated?: string
  surfaceOverlay?: string
}

/** Text color variants */
export interface TextColors {
  primary: string
  secondary: string
  muted: string
  invert: string
  link?: string
  linkHover?: string
  disabled?: string
}

/** Border color variants */
export interface BorderColors {
  light: string
  default: string
  dark: string
  focus?: string
}

/** Interactive state colors */
export interface InteractiveColors {
  hover?: string
  active?: string
  focus?: string
  focusRing?: string
  disabled?: string
  selected?: string
}

/** Form input colors */
export interface InputColors {
  bg?: string
  border?: string
  borderHover?: string
  borderFocus?: string
  placeholder?: string
  ring?: string
}

/** Chart color palette (up to 12 colors) */
export interface ChartColors {
  '1'?: string
  '2'?: string
  '3'?: string
  '4'?: string
  '5'?: string
  '6'?: string
  '7'?: string
  '8'?: string
  '9'?: string
  '10'?: string
  '11'?: string
  '12'?: string
}

/** Named accent colors */
export interface AccentColors {
  teal?: ColorScale | string
  purple?: ColorScale | string
  pink?: ColorScale | string
  orange?: ColorScale | string
  cyan?: ColorScale | string
  lime?: ColorScale | string
  amber?: ColorScale | string
  rose?: ColorScale | string
  indigo?: ColorScale | string
  emerald?: ColorScale | string
}

/** Neutral/gray palette for UI */
export interface NeutralColors {
  '50'?: string
  '100'?: string
  '200'?: string
  '300'?: string
  '400'?: string
  '500'?: string
  '600'?: string
  '700'?: string
  '800'?: string
  '900'?: string
  '950'?: string
}

/** All theme colors */
export interface ThemeColors {
  // Core brand colors
  primary: ColorScale
  secondary: ColorScale
  accent?: string

  // Semantic colors
  background: BackgroundColors
  text: TextColors
  border: BorderColors
  status: StatusColors

  // Extended palettes (optional)
  neutral?: NeutralColors
  interactive?: InteractiveColors
  input?: InputColors
  chart?: ChartColors
  accents?: AccentColors
}

/** Gradient definitions */
export interface ThemeGradients {
  hero: string
  primary: string
  accent: string
  dark?: string
  card?: string
  // Directional gradients
  toRight?: string
  toBottom?: string
  radial?: string
}

/** Font families */
export interface ThemeFonts {
  heading: string
  body: string
  mono?: string
}

/** Typography settings */
export interface TypographySettings {
  size: string
  weight: string
  line_height: string
}

export interface ThemeTypography {
  h1?: TypographySettings
  h2?: TypographySettings
  h3?: TypographySettings
  h4?: TypographySettings
  body?: TypographySettings
  small?: TypographySettings
}

/** UI settings (shadows, radii, etc.) */
export interface ThemeUI {
  border_radius: string
  border_radius_sm?: string
  border_radius_lg?: string
  border_radius_xl?: string
  border_radius_full?: string
  shadow_sm?: string
  shadow_md?: string
  shadow_lg?: string
  shadow_xl?: string
  shadow_card?: string
  shadow_button?: string
  shadow_input?: string
  shadow_dropdown?: string
}

/** Spacing settings */
export interface ThemeSpacing {
  section_padding?: string
  container_max_width?: string
  card_padding?: string
  input_padding?: string
}

/** Animation/transition settings */
export interface ThemeAnimations {
  transition_fast?: string
  transition_normal?: string
  transition_slow?: string
  hover_scale?: string
  hover_lift?: string
}

/** Complete clinic theme */
export interface ClinicTheme {
  colors: ThemeColors
  gradients: ThemeGradients
  fonts: ThemeFonts
  typography?: ThemeTypography
  ui: ThemeUI
  spacing?: ThemeSpacing
  animations?: ThemeAnimations
}

// ============================================================================
// Images Types (already defined in clinics.ts, re-exported here for completeness)
// ============================================================================

export interface ClinicImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface ImageCategory {
  [key: string]: ClinicImage
}

export interface ClinicImages {
  version: string
  basePath: string
  images: {
    hero?: ImageCategory
    team?: ImageCategory
    facilities?: ImageCategory
    services?: ImageCategory
    features?: ImageCategory
    store?: ImageCategory
    tools?: ImageCategory
    patterns?: ImageCategory
    branding?: ImageCategory
    brands?: ImageCategory
    [category: string]: ImageCategory | undefined
  }
  placeholders?: {
    pet?: string
    product?: string
    team?: string
    service?: string
  }
}

// ============================================================================
// Complete Clinic Data Type
// ============================================================================

export interface ClinicData {
  config: ClinicConfig
  theme: ClinicTheme
  images?: ClinicImages
  home: HomeData
  services: ServicesData
  about: AboutData
  testimonials?: TestimonialsData
  faq?: FaqData
  legal?: LegalData
}
