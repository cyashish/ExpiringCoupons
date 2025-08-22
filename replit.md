# CouponTracker Application

## Overview

CouponTracker is a full-stack web application designed to help users manage and track their digital coupons and promotional codes. The application automatically scans emails for coupon codes, organizes them by categories, tracks expiration dates, and provides reminder functionality. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with JSON responses
- **Middleware**: Express middleware for request logging, JSON parsing, and error handling
- **Development**: Hot reload with tsx for development server

### Data Storage
- **Database**: PostgreSQL with Neon serverless database provider
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection**: Connection pooling through @neondatabase/serverless

### Database Schema Design
The application uses four main entities:
- **Users**: Authentication and user management
- **Coupons**: Core coupon data with categories (food, ecommerce, travel, banking)
- **Email Accounts**: Connected email accounts for scanning
- **Scan Settings**: User preferences for automated scanning and notifications

### Authentication & Authorization
- Basic username/password authentication system
- Session-based authentication with secure cookie handling
- User isolation for data access

### Component Architecture
- **Shared Components**: Reusable UI components in `client/src/components/`
- **Page Components**: Route-specific components in `client/src/pages/`
- **Layout System**: Consistent navigation and header across all pages
- **Card-based UI**: Modular card components for coupons, categories, and statistics

### Development Workflow
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Shared Types**: Common TypeScript definitions in `/shared` directory
- **Path Aliases**: Configured for clean imports across client-side code
- **Hot Reload**: Development environment with automatic restart and browser refresh

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Database toolkit and query builder
- **Environment Variables**: `DATABASE_URL` for database connection

### UI & Styling Framework
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool with development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Autoprefixer

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & class-variance-authority**: Dynamic className utilities
- **zod**: Schema validation for type-safe data handling
- **wouter**: Lightweight React router

### Deployment Configuration
- **Netlify Ready**: Configured for Netlify deployment with serverless functions
- **Build Command**: `npm run build` (Vite builds frontend to `/dist`)
- **Serverless Backend**: Express routes converted to Netlify Functions
- **Redirects**: API routes automatically redirect to `/.netlify/functions/api/*`
- **No Custom Domain Required**: Deploys to `https://[site-name].netlify.app`

### Integrations Implemented
- **Gmail OAuth Integration**: Secure SSO-style authentication (no passwords stored)
- **Export Functionality**: Spreadsheet export for coupon data
- **Category Management**: Automatic organization by merchant type
- **Alert System**: Configurable expiry notifications