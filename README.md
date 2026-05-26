# GlobalStore - Multi-language E-commerce Store

A modern, responsive e-commerce platform built with Next.js 16, supporting 8 languages with RTL support.

## 🌍 Supported Languages

- English (en) 🇬🇧
- French (fr) 🇫🇷
- German (de) 🇩🇪
- Arabic (ar) 🇸🇦 - RTL Support
- Chinese (zh) 🇨🇳
- Hindi (hi) 🇮🇳
- Spanish (es) 🇪🇸
- Russian (ru) 🇷🇺

## ✨ Features

- 🌐 Multi-language support with next-intl
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast performance with Next.js 16
- 📱 Fully responsive design
- 🔄 RTL support for Arabic
- 🛒 Product filtering and sorting
- ⭐ Star ratings
- 🎭 Smooth animations with Framer Motion
- 🎠 Brand carousel with Swiper
- 🔍 Product search functionality

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [https://z-fashion-ecru.vercel.app](https://z-fashion-ecru.vercel.app) to view the site.

## 📁 Project Structure

```
ecommerce-store/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx      # Root layout with i18n
│   │   └── page.tsx         # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── AnnouncementBar.tsx  # Top announcement banner
│   ├── Navbar.tsx           # Navigation with language switcher
│   ├── Filters.tsx          # Sidebar filters
│   ├── ProductCard.tsx      # Product display card
│   ├── ProductGrid.tsx      # Products grid with search/sort
│   ├── BrandsSection.tsx    # Featured brands carousel
│   └── Footer.tsx           # Footer with newsletter
├── i18n/
│   ├── routing.ts           # i18n routing config
│   └── request.ts           # i18n request config
├── messages/                # Translation files
│   ├── en.json
│   ├── fr.json
│   ├── de.json
│   ├── ar.json
│   ├── zh.json
│   ├── hi.json
│   ├── es.json
│   └── ru.json
├── lib/
│   └── data.ts              # Mock product data
└── middleware.ts            # i18n middleware

```

## 🛠️ Technologies Used

- **Next.js 16.1.5** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **next-intl** - Internationalization
- **Framer Motion** - Animations
- **Swiper** - Carousels
- **React Icons** - Icons
- **React Rating Stars** - Product ratings

## 🎨 Design Features

- Light color scheme
- Google Fonts (Inter & Cairo)
- Smooth transitions
- Hover effects
- Responsive breakpoints
- Custom scrollbar

## 📝 License

MIT License

## 👨‍💻 Developer

Built with ❤️ using Next.js and modern web technologies
