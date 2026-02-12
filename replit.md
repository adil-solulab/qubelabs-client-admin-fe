# replit.md

## Overview

CONX is an enterprise AI platform built as a single-page application (SPA) for managing conversational AI operations. The platform provides comprehensive tools for managing AI agents, knowledge bases, live operations monitoring, outbound calling campaigns, analytics, and team management. It features a role-based access control system with three user types: Client Admin, Supervisor, and Agent.

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

### Sidebar Navigation (Grouped)
- Grouped navigation with collapsible section headers in `src/components/layout/Sidebar.tsx`
- **Main**: Home, Dashboard (no header)
- **AI Platform**: AI Agents, Knowledge Base, AI Engine, Flow Builder
- **Operations**: Live Ops, Callbacks, Outbound Calls, Channels
- **Insights**: Analytics, Surveys
- **Management**: Users, Roles, Security
- **Configure**: Integrations, Billing, SDKs, Theme, Profile
- Section headers are clickable to collapse/expand groups
- Collapsed sidebar shows divider lines between groups
- Active group headers highlighted in primary color
- Role-based filtering preserved across all groups

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

### Knowledge Base Multi-Source Architecture
- **File Uploads**: Traditional document upload (PDF, DOCX, TXT, MD, CSV, XLSX) with drag & drop
- **URL Scraping**: Single or bulk URL crawling with content extraction and cleaning
- **Sitemap Discovery**: XML sitemap parsing to auto-discover and crawl all website pages
- **Integration Import**: Import from third-party services (Salesforce, Confluence, Zendesk, Notion, SharePoint, Google Drive, AWS S3, ServiceNow, Freshdesk, Database)
- **Auto-Sync**: Configurable sync frequency (manual, hourly, daily, weekly) for URLs, sitemaps, and integrations
- Each source type has its own tab, card component, add modal, and training/sync/delete actions
- Components: `URLSourceCard`, `SitemapSourceCard`, `IntegrationSourceCard`, `AddURLModal`, `AddSitemapModal`, `AddIntegrationSourceModal`

### Integrations Page (Yellow.ai Style)
- Redesigned with category sidebar, grouped card grid, and integration detail view
- 24 integrations across 8 categories (CRM, ITSM, HR, Tools, Payment, Live Chat, Retail, Communication)
- Each integration has configuration fields, setup instructions, and connection management
- API Keys and Webhooks remain in separate tabs

### Analytics Module (Enhanced)
- **Subtab Navigation**: 7 tabs - Overview, Channels, Sentiment & Speech, LLM Analytics, Transcription, Compliance, Campaigns
- **Outcome KPIs**: Time Saved, Effort Saved, Conversion Rate, Engagement Rate, CSAT Score with sparkline charts and trend indicators
- **KPICard Component**: Reusable card with icon mapping, sparkline (recharts LineChart), trend direction, and color variants
- **Campaign Analytics**: Email open rate, CTR, bounce rate, conversion funnel visualization, campaign performance table
- **Channel Analytics**: Per-channel metrics (chat/voice/email) with volume sparklines and comparison charts
- **LLM Analytics**: Model usage breakdown, token usage over time, accuracy tracking, prompt categories
- **Transcription Analytics**: Accuracy tracking, language breakdown, keyword extraction with sentiment, error categorization
- **Compliance Monitoring**: Risk distribution, flagged interactions, violation categories with severity, recent violations table
- **Sentiment & Speech**: Intent detection, emotion analysis, sentiment breakdown pie chart, speech-to-text accuracy
- **Dashboard Integration**: Dive Deep buttons on KPI cards link to specific analytics tabs via URL query params (?tab=xxx)
- **Widget Registry**: Extended with outcome KPIs (time-saved, effort-saved, conversion-rate, engagement-rate)
- Components in `src/components/analytics/`: KPICard, OverviewTab, ChannelsTab, SentimentSpeechTab, LLMAnalyticsTab, TranscriptionTab, ComplianceTab, CampaignAnalytics

### Security & Compliance Module (Enhanced)
- **5-Tab Structure**: Compliance, SSO, RBAC, Moderation, Audit Logs
- **Compliance Tab**: PII Protection (8 detection types, 4 action modes), Zero Retention Policy (scope/mode controls), Consent Management, GDPR Controls, Data Masking, Data Retention
- **SSO Tab**: 5 identity providers (SAML, OIDC, Azure AD, Okta, Google), domain allowlist, session timeout, auto-provision, enforce/fallback controls
- **RBAC Tab**: MFA (TOTP/SMS/Email), password policy (length/complexity/expiry/reuse), session policy (concurrent/idle/absolute timeouts), IP restrictions with allowlist
- **Moderation Tab**: Content rules (profanity, spam, hate speech, custom patterns) with action/severity controls
- **Audit Logs Tab**: Searchable/filterable log table with export
- PII Protection moved from Moderation to Compliance for clearer grouping
- Types in `src/types/security.ts`, data hook in `src/hooks/useSecurityData.ts`

### No Backend Currently
- Application runs entirely in the browser
- All data is mocked and stored in React state
- Ready for backend integration (API structures implied by data hooks)