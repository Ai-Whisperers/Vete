# Database Seeds

This directory contains comprehensive seed data and setup scripts for the veterinary platform.

## 📁 Directory Structure

```
seeds/
├── data/                    # JSON data files
│   ├── _schemas/           # JSON schema definitions
│   ├── 00-core/            # Core system data (tenants, demo accounts)
│   ├── 01-reference/       # Reference data (diagnoses, drugs, etc.)
│   ├── 02-clinic/          # Clinic-specific data
│   └── 03-store/           # Store/e-commerce data
├── scripts/                # Executable scripts
│   ├── seed-from-json.ts   # SQL generation script
│   ├── setup-via-api.ts    # API-based setup script
│   ├── setup               # CLI wrapper script
│   └── transform-services.js # Utility script
├── docs/                   # Documentation
│   ├── README-API-SETUP.md # API-based setup guide
│   └── MIGRATION-GUIDE.md  # Migration documentation
└── generated-seed.sql      # Generated SQL file
```

## 🚀 Quick Start

### API-Based Setup (Recommended)

For development and testing, use the API-based approach:

```bash
# Basic clinic setup
npm run env:setup:basic

# Full clinic with sample data
npm run env:setup:full

# Complete demo environment
npm run env:setup:demo

# Clear environment
npm run env:clear

# Reset to demo state
npm run env:reset
```

### SQL-Based Setup (Legacy)

For direct database seeding:

```bash
# Generate SQL from JSON files
npm run db:seeds

# Apply to database
npm run db:seeds:load
```

## 📊 Data Coverage

The seed data provides comprehensive coverage for testing:

- **18+ pets** with complete medical histories
- **20+ appointments** across different statuses
- **Hospitalization workflows** with kennel management
- **1000+ store products** across all categories
- **Complete medical records** and vaccination histories
- **Multi-tenant architecture** with isolated clinic data

## 📖 Documentation

- **[API Setup Guide](docs/README-API-SETUP.md)** - Complete guide for API-based environment setup
- **[Migration Guide](docs/MIGRATION-GUIDE.md)** - Migrating from SQL to API-based seeding

## 🛠️ Scripts

### API-Based Scripts

- `scripts/setup-via-api.ts` - Main API setup script
- `scripts/setup` - CLI wrapper for common operations

### SQL-Based Scripts

- `scripts/seed-from-json.ts` - Generates SQL from JSON files
- `scripts/transform-services.js` - Service data transformation utility

## 🔧 Development

### Adding New Seed Data

1. **JSON Structure**: Add new data files following the existing schema in `data/_schemas/`
2. **API Integration**: Update `scripts/setup-via-api.ts` if adding new entity types
3. **SQL Generation**: Update `scripts/seed-from-json.ts` for SQL-based seeding

### Testing Seed Data

```bash
# Test API-based setup
npm run env:setup:basic

# Test SQL generation
npm run db:seeds

# Verify data integrity
npm run db:seeds:verify
```

## 📋 File Organization

### Data Files (`data/`)

- **00-core/**: Tenants, demo accounts, global settings
- **01-reference/**: Medical reference data (diagnoses, drugs, growth standards)
- **02-clinic/**: Clinic-specific operational data
- **03-store/**: Product catalog and e-commerce data

### Scripts (`scripts/`)

- **setup-via-api.ts**: Modern API-based seeding with ID tracking
- **seed-from-json.ts**: Legacy SQL generation from JSON
- **setup**: Bash wrapper for common CLI operations

### Documentation (`docs/`)

- Comprehensive guides for setup and migration
- API reference and troubleshooting guides
