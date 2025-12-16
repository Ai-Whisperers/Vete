# Style Guide & Component System (v2)

## 1. Technology

- **CSS Framework**: TailwindCSS.
- **Icons**: Lucide React (Clean, modern SVG icons).
- **Fonts**: Google Fonts (`Montserrat` for Headers, `Inter` for UI).

## 2. Design Tokens (Tailwind Config)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#91ba2e", // Brand Green
          dark: "#7a9e25",
          light: "#e8f0d5", // Backgrounds
        },
        accent: {
          DEFAULT: "#dda61f", // Gold/Warning
          hover: "#c0901a",
        },
        text: {
          main: "#3e382a", // Dark Brown/Gray
          muted: "#6b7280",
        },
        status: {
          success: "#10b981", // Verified
          warning: "#f59e0b", // Due Soon
          error: "#ef4444", // Toxic/Expired
        },
      },
      borderRadius: {
        card: "12px",
        btn: "9999px", // Pill shape
      },
    },
  },
};
```

## 3. UI Components (Atoms)

### Buttons

- **Primary Button** (`btn-primary`):
  - bg-accent, text-white, px-6, py-3, rounded-btn, font-bold, shadow-lg, hover:scale-105.
  - _Usage_: "Book Appointment", "Emergency Call".
- **Secondary Button** (`btn-outline`):
  - border-2, border-primary, text-primary, bg-transparent, hover:bg-primary-light.
  - _Usage_: "View Services", "Login".

### Cards

- **Service Card**:
  - bg-white, rounded-card, shadow-md, p-6, border-b-4 border-primary.
  - Icon: text-primary, w-12, h-12.
- **Vaccine Card (Row)**:
  - flex-row, items-center, p-4, border-l-4.
  - _Verified_: border-status-success, bg-green-50.
  - _Unverified_: border-gray-300, bg-gray-50.

### Inputs (Forms)

- **Search Bar** (Toxic Checker):
  - w-full, p-4, rounded-full, border-2 border-gray-200, focus:border-primary, text-lg.
