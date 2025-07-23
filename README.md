# Fusion Starter - Next.js + React Router

A production-ready Next.js application with React Router integration, featuring modern UI components, TypeScript, and TailwindCSS.

## Tech Stack

- **Framework**: Next.js 14 with React Router 6
- **Frontend**: React 18 + TypeScript + TailwindCSS 3
- **UI Components**: Radix UI + Shadcn/ui components
- **State Management**: TanStack Query
- **Icons**: Lucide React
- **Styling**: TailwindCSS 3 with CSS Variables

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn/ui component library
│   ├── Sidebar.tsx      # Main navigation sidebar
│   └── NoRequestsChart.tsx
├── pages/               # Next.js pages and React Router routes
│   ├── _app.tsx         # Next.js app wrapper with React Router
│   ├── _document.tsx    # HTML document structure
│   ├── index.tsx        # Next.js entry point
│   ├── api/             # Next.js API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── documents/       # Document management pages
│   └── error/           # Error pages
├── lib/                 # Utility functions
├── hooks/               # Custom React hooks
└── styles/              # Global styles
    └── globals.css      # TailwindCSS and CSS variables

shared/                  # Shared types between client and server
└── api.ts              # API interface definitions
```

## Key Features

### React Router Integration
- **Client-side routing** using React Router 6
- **File-based API routes** using Next.js API routes
- **Hybrid approach** combining Next.js architecture with React Router navigation

### Responsive Dashboard
- **Sidebar navigation** with collapsible sections
- **Mobile-responsive** design with hamburger menu
- **Modern UI** using Shadcn/ui components

### Document Management
- **Upload functionality** with drag & drop
- **Document listing** with search and filtering
- **Progress tracking** for file uploads

### Authentication
- **Login page** with form validation
- **Password visibility toggle**
- **Remember me** functionality

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Development Server

The app runs on `http://localhost:3000` by default.

## Pages and Routes

- `/` - Dashboard home page
- `/login` - Authentication page  
- `/upload` - Document upload page
- `/documents` - All documents listing
- `/api/demo` - Demo API endpoint
- `/api/ping` - Health check endpoint

## Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme**: CSS variables defined in `globals.css`
- **Components**: Pre-built Shadcn/ui component library
- **Responsive**: Mobile-first responsive design

## API Routes

Next.js API routes are located in `src/pages/api/`:
- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint

## Deployment

The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify** 
- **Docker** containers
- Any **Node.js** hosting platform

## Architecture Notes

- **Hybrid routing**: Next.js handles the app structure while React Router manages client-side navigation
- **Type-safe**: Full TypeScript support throughout
- **Modern tooling**: Latest versions of React, Next.js, and TailwindCSS
- **Production-ready**: Optimized build with code splitting and SEO support
