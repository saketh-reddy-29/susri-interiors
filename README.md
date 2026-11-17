# SUSRI INTERIORS

A high-end, responsive architectural and interior design studio website cloned and customized for **SUSRI INTERIORS**.

---

## 🏛️ Features

- **Full Architectural Portfolio & Case Studies**: Complete detail pages for works including *Camber, Lumina, Strata, Vellum, Basalt Ridge, Quarry Studio, Aura Loft, Villa Forma, Ochre, and Sable*.
- **Comprehensive Pages**:
  - `Home (/)`: Hero showcase, disciplines overview, elements, selected works gallery, testimonials, and contact CTA.
  - `About (/about)`: Studio origins, philosophy, leadership, and process.
  - `Archive (/archive)`: Curated gallery of architectural and interior projects.
  - `Practice (/practice)`: Detailed breakdowns for *Interior Architecture, Custom Fabrication, Bespoke Curation, and Turnkey Execution*.
  - `Journal (/journal)`: Essays, architectural dialogues, and material research articles.
  - `Enquiries & Contact (/enquiries, /contact)`: Inquiries, project commission forms, and studio contact lines.
  - `Legal (/legal/privacy-policy, /legal/terms-of-service)`: Complete policy pages.
- **Brand Customization**:
  - Studio name rebranded to **SUSRI INTERIORS** across all pages, navigation, metadata, and client-side hydration chunks.
  - Direct communication channels updated to `studio@susriinteriors.com`, `press@susriinteriors.com`, and `workshop@susriinteriors.com`.
  - Modulify badges and third-party tracking scripts completely purged.
  - Custom SVG favicon and SEO meta headers configured.
- **Offline & Local-Ready Assets**:
  - All 125 original high-resolution photography and texture assets bundled in `/images/`.
  - All Geist and Geist Mono webfonts bundled in `/_next/static/media/`.
  - Tailwind styling and interactions bundled in `/_next/static/chunks/`.

---

## 🚀 Quick Start

You can run the website locally using either Python or Node.js.

### Option 1: Python (Zero Dependencies)
```bash
python serve.py
```
Open **[http://localhost:3000](http://localhost:3000)** (or the port shown in the console) in your web browser.

### Option 2: Node.js (Zero Dependencies)
```bash
npm start
```
or
```bash
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 📁 Project Directory Structure

```
SUSRI INTERIORS/
├── index.html                   # Homepage
├── about/                       # Origins / Studio Philosophy
├── archive/                     # Project Portfolio & Detail Pages
│   ├── aura-loft/
│   ├── basalt-ridge/
│   ├── camber/
│   ├── lumina/
│   ├── ochre/
│   ├── quarry-studio/
│   ├── sable/
│   ├── strata/
│   ├── vellum/
│   └── villa-forma/
├── practice/                    # Disciplines & Services
│   ├── bespoke-curation/
│   ├── custom-fabrication/
│   ├── interior-architecture/
│   └── turnkey-execution/
├── journal/                     # Studio Journal & Articles
├── contact/                     # Contact Page
├── enquiries/                   # Client Inquiries & Commissions
├── legal/                       # Privacy Policy & Terms of Service
├── images/                      # 125 High-Resolution Photography & Renders
├── _next/                       # CSS Styles, Webfonts, and JS Bundles
├── favicon.svg                  # SUSRI INTERIORS Architectural Monogram Favicon
├── serve.py                     # Python Local HTTP Server
├── server.js                    # Node.js Local HTTP Server
└── package.json                 # Project Metadata and Scripts
```

---

## 🌐 Deployment

This project is fully static and can be deployed anywhere with a single click:
- **Vercel**: Run `vercel` or connect your GitHub repository.
- **Netlify**: Drag and drop the folder or connect via GitHub.
- **Cloudflare Pages / GitHub Pages**: Deploy directory directly.

