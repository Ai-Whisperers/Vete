# Adris/Vete Multi-Tenant Platform

A Next.js 15 application designed to host multiple veterinary clinic websites from a single codebase using a JSON-based CMS pattern.

## 🚀 Quick Start

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
3.  **Open Browser:**
    Go to [http://localhost:3000/adris](http://localhost:3000/adris)

## 📚 Documentation

Detailed documentation is reorganized in the [`../documentation`](../documentation) folder.

- **[Technical Architecture](documentation/technical/architecture.md)**
- **[Deployment Strategy](documentation/technical/deployment.md)**
- **[Content Guide (CMS)](documentation/guides/cms-content.md)**

## ⚠️ Important for Developers

This project uses **Tailwind CSS v3** and a hidden `.content_data` directory to avoid build errors. **Do not upgrade to Tailwind v4** without reading the [deployment technical guide](documentation/technical/deployment.md).
