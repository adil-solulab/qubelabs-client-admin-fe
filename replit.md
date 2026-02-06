# replit.md

## Overview

QubeLabs is an enterprise AI platform built as a single-page application (SPA) for managing conversational AI operations. The platform provides comprehensive tools for managing AI agents, knowledge bases, live operations monitoring, outbound calling campaigns, analytics, and team management. It features a role-based access control system with three user types: Client Admin, Supervisor, and Agent.

The application is a frontend-only implementation using in-memory state management, designed as an interactive prototype that maintains state across navigation without requiring a backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server (runs on port 5000)
- **React Router** for client-side routing with protected routes

### UI Component Architecture
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming
- Components follow atomic design principles with reusable UI primitives in `src/components/ui/`
- Feature-specific components organized by domain (e.g., `aiAgents/`, `dashboard/`, `liveOps/`)

### State Management
- **In-memory state** using React hooks (`useState`, `useCallback`) in custom hooks
- Each feature has a dedicated data hook (e.g., `useAIAgentsData`, `useDashboardData`, `useBillingData`)
- **React Query** (`@tanstack/react-query`) is available for async state management
- State persists across navigation but resets on page refresh

### Authentication & Authorization
- Custom `AuthContext` in `useAuth.tsx` provides authentication state
- Role-based access control with three system roles: Client Admin, Supervisor, Agent
- `ProtectedRoute` component guards authenticated routes
- `usePermission` hook for action-level permission checks
- Permission-gated UI components (`PermissionButton`)

### Theming System
- `ThemeProvider` in `useTheme.tsx` manages theme configuration
- Supports light/dark/system modes
- Customizable colors, fonts, spacing, and border radius
- Theme settings persist in memory

### Routing Structure
- Public routes: `/login`, `/forgot-password`
- Protected routes: Dashboard (`/`), Users, AI Agents, Knowledge Base, Channels, Flow Builder, Live Ops, Callbacks, Surveys, Outbound Calls, Analytics, Billing, Integrations, Security, SDKs, Theme Settings, Roles, AI Engine, Profile

### Notification System
- Centralized notification using Sonner toast library
- `useNotification` hook provides standardized success, error, warning, info, and promise-based notifications
- `notify` export for direct access outside React components

### Key Design Patterns
- Feature modules are self-contained with types, hooks, and components
- Type definitions in `src/types/` define domain models
- Modal-based CRUD operations with confirmation dialogs
- Real-time simulation for live operations features

## External Dependencies

### UI Libraries
- **Radix UI** - Accessible, unstyled component primitives (accordion, dialog, dropdown, tabs, etc.)
- **Lucide React** - Icon library
- **Recharts** - Charting library for analytics visualizations
- **Embla Carousel** - Carousel component
- **cmdk** - Command palette component
- **react-day-picker** - Date picker component
- **date-fns** - Date utility library

### Form & Validation
- **React Hook Form** with `@hookform/resolvers` for form handling
- **Zod** (implied by resolvers) for schema validation

### Styling
- **Tailwind CSS** with custom configuration
- **class-variance-authority** - For creating variant-based component styles
- **clsx** and **tailwind-merge** - Class name utilities

### State & Data
- **@tanstack/react-query** - Async state management (available but not extensively used yet)
- **next-themes** - Theme persistence utilities

### Testing
- **Vitest** - Test runner configured with jsdom environment
- **@testing-library/jest-dom** - DOM testing utilities

### Build & Development
- **Vite** - Build tool with React SWC plugin
- **TypeScript** - Type checking with relaxed settings (no strict mode)
- **ESLint** - Linting with React hooks and refresh plugins
- **PostCSS** with Autoprefixer - CSS processing

### No Backend Currently
- Application runs entirely in the browser
- All data is mocked and stored in React state
- Ready for backend integration (API structures implied by data hooks)