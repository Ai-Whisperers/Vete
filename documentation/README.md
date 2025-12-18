# Vete - Multi-Tenant Veterinary Platform

Welcome to the technical documentation for **Vete**, a comprehensive multi-tenant veterinary clinic platform built with Next.js 15, Supabase, and TypeScript.

## Quick Links

| Section | Description |
|---------|-------------|
| [Getting Started](getting-started/quick-start.md) | Set up your development environment |
| [Architecture](architecture/overview.md) | System design and patterns |
| [Database](database/overview.md) | Schema, migrations, and RLS |
| [API Reference](api/overview.md) | REST endpoints and Server Actions |
| [Features](features/overview.md) | All implemented features |
| [Development](development/setup.md) | Contributing and coding standards |

---

## Platform Overview

Vete is a **SaaS veterinary management platform** that provides:

- **Multi-tenant architecture** - Single codebase serves multiple clinic websites
- **JSON-CMS content system** - Clinics customize content without code changes
- **Dynamic theming** - Each clinic has its own branding/colors
- **Comprehensive clinic management** - Appointments, medical records, inventory, invoicing
- **Clinical decision support** - Drug dosages, diagnosis codes, growth charts
- **Pet owner portal** - Owners manage their pets, view records, book appointments
- **Real-time features** - Live dashboard updates, notifications

### Target Market

- Veterinary clinics in Paraguay (Spanish-speaking)
- Small to medium clinics seeking digital transformation
- Multi-location veterinary groups

### Current Tenants

- `adris` - Veterinaria Adris
- `petlife` - PetLife Center

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 15.5.9 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Database** | Supabase (PostgreSQL) | - |
| **Auth** | Supabase Auth | - |
| **Storage** | Supabase Storage | - |
| **PDF** | @react-pdf/renderer | 4.3.1 |
| **Charts** | recharts | 3.6.0 |
| **Testing** | Vitest + Playwright | - |

> **Important**: This project uses Tailwind CSS v3, NOT v4. Do not upgrade.

---

## Documentation Structure

```
documentation/
├── getting-started/         # Setup and first steps
│   ├── quick-start.md
│   ├── installation.md
│   └── environment-variables.md
│
├── architecture/            # System design
│   ├── overview.md
│   ├── multi-tenancy.md
│   ├── json-cms.md
│   ├── theming.md
│   └── security.md
│
├── database/               # Supabase/PostgreSQL
│   ├── overview.md
│   ├── schema-reference.md
│   ├── migrations.md
│   └── rls-policies.md
│
├── api/                    # API documentation
│   ├── overview.md
│   ├── endpoints/
│   └── server-actions.md
│
├── features/               # Feature documentation
│   ├── overview.md
│   ├── public-website/
│   ├── pet-management/
│   ├── clinical-tools/
│   ├── business-tools/
│   ├── hospitalization/
│   └── communication/
│
├── development/            # Developer guides
│   ├── setup.md
│   ├── testing.md
│   └── contributing.md
│
├── product/               # Product documentation
│   └── vision.md
│
└── reference/             # Reference materials
    └── glossary.md
```

---

## Quick Start

```bash
# Clone and install
cd web
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Access clinics
open http://localhost:3000/adris
open http://localhost:3000/petlife
```

See [Getting Started Guide](getting-started/quick-start.md) for detailed setup.

---

## Key Concepts

### Multi-Tenancy

Each clinic operates as an isolated tenant:
- Routes: `/[clinic]/*` (e.g., `/adris/services`)
- Content: `.content_data/[clinic]/` JSON files
- Database: `tenant_id` column + RLS policies

### JSON-CMS

Content is decoupled from code:
- `config.json` - Clinic settings, contact, modules
- `theme.json` - Colors, fonts, gradients
- `services.json` - Service catalog with pricing
- `home.json` - Homepage content

### Role-Based Access

| Role | Capabilities |
|------|--------------|
| `owner` | Pet owners - manage their pets, book appointments |
| `vet` | Veterinarians - full medical access, prescriptions |
| `admin` | Clinic administrators - all access + settings |

---

## Feature Summary

### Public Website
- Dynamic homepage with hero, features, testimonials
- Service catalog with pricing
- About page with team profiles
- Online appointment booking
- Contact information with WhatsApp integration

### Pet Management
- Pet profiles with photos
- Vaccine records and schedules
- Medical history timeline
- QR code identification tags
- Lost & found registry

### Clinical Tools
- Digital prescriptions with PDF export
- Diagnosis code search (VeNom/SNOMED)
- Drug dosage calculator
- Growth charts and tracking
- Vaccine reaction monitoring
- Quality of life assessments (HHHHHMM scale)
- Reproductive cycle tracking

### Business Tools
- Appointment scheduling
- Full invoicing system
- Inventory management with WAC
- Expense tracking
- Loyalty points program
- Campaign management

### Hospitalization
- Kennel/cage management
- Vitals monitoring
- Treatment scheduling
- Feeding logs
- Visitor management

### Communication
- In-app messaging
- SMS/WhatsApp/Email notifications
- Automated reminders
- Broadcast campaigns

---

## Contributing

See [Contributing Guide](development/contributing.md) for:
- Code style standards
- Pull request process
- Testing requirements

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Questions**: Contact the development team

---

*Last updated: December 2024*
