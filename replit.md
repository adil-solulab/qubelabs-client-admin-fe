# replit.md

## Overview

QubeLabs is an enterprise AI platform designed as a single-page application (SPA) for managing conversational AI operations. It offers comprehensive tools for AI agent management, knowledge base creation, live operations monitoring, outbound calling campaigns, analytics, and team management. The platform features a robust role-based access control system for Client Admins, Supervisors, and Agents. The core vision is to provide "responsible intelligence" through an interactive prototype that maintains state without a backend.

The application serves as a frontend-only prototype, utilizing in-memory state management to demonstrate functionality and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application is built with React 18 and TypeScript, using Vite as the build tool. React Router handles client-side navigation with protected routes.

### UI/UX Decisions
- **Brand Identity**: QubeLabs, tagline "responsible intelligence". Uses primary blue (#0094FF), primary green (#00FF7A), dark navy (#011B40), and dark (#000A17). Font is DM Sans.
- **Component Library**: `shadcn/ui` based on Radix UI primitives, styled with Tailwind CSS and CSS variables for theming. Components follow atomic design principles.
- **Theming**: Supports light/dark/system modes with customizable colors, fonts, spacing, and border radius, managed by `ThemeProvider`.
- **Sidebar Navigation**: Grouped, collapsible navigation with role-based filtering, highlighting active group headers.

### Technical Implementations
- **State Management**: Primarily in-memory state using React hooks. Feature-specific data hooks (e.g., `useAIAgentsData`, `useDashboardData`) manage data. `@tanstack/react-query` is available for async state.
- **Authentication & Authorization**: Custom `AuthContext` provides authentication. Role-based access control includes Client Admin, Supervisor, and Agent roles, with `ProtectedRoute` for route guarding and `usePermission` for action-level checks.
- **Notification System**: Centralized notifications using Sonner, with a `useNotification` hook for various alert types.
- **Form Handling**: React Hook Form with Zod for schema validation.

### Feature Specifications

#### Knowledge Base Multi-Source Architecture
- Supports file uploads (PDF, DOCX, TXT, MD, CSV, XLSX), URL scraping (single/bulk), sitemap discovery, and integration imports (Salesforce, Confluence, Zendesk, Notion, SharePoint, Google Drive, AWS S3, ServiceNow, Freshdesk, Database).
- Features auto-sync capabilities with configurable frequencies.
- A unified `AddSourceModal` provides a single interface for adding various source types.

#### AI Agents (Super Agent + Agent Architecture)
- Employs a Super Agent (orchestrator) and specialized Agents (specialists) model.
- **Super Agent**: Routes queries, handles welcome messages, small talk, fallback, and maintains context. Only one Super Agent is allowed.
- **Agents**: Domain-specific agents for sales, support, technical, and knowledge base functions, linked to a parent Super Agent.
- **Configuration Sections (per agent)**: Persona, Intent Understanding, Start Triggers, Prompt Logic, Variables, Routing Logic, Fallback Behavior, Context Handling, and Guardrails.
- UI features an agent listing view and a detailed configuration view with collapsible sections.

#### Flow Builder (Flows) - Main USP
- Visual drag-and-drop canvas for designing conversational flows and background workflows.
- Features an environment selector (Staging, Sandbox, Production) and a category sidebar for flow organization.
- Supports two creation modes: "Start from scratch" (conversational) and "Create Workflow" (background).
- Flow Editor includes a Node Tools sidebar with 7 node types (Message, Condition, API Call, DTMF, AI Assistant, Transfer, End), a canvas for design, and right panels for Node Properties and Test Panel.
- The Test Panel supports Chat and Voice modes, simulating various node functionalities and providing test statistics.

#### Integrations
- Redesigned interface with a category sidebar and grouped card grid.
- Covers 19 integrations across CRM, Voice, Communications, LiveChat, and Payments categories.
- Each integration includes configuration fields, setup instructions, and connection management.

#### Analytics Module
- Features 7 sub-tabs: Overview, Channels, Sentiment & Speech, LLM Analytics, Transcription, Compliance, Campaigns.
- Tracks Outcome KPIs like Time Saved, Effort Saved, Conversion Rate, Engagement Rate, and CSAT Score with sparkline charts.
- Provides detailed analytics for campaigns, channels, LLM usage, transcription accuracy, and compliance.
- Includes a `KPICard` component for reusable KPI visualization.

#### Security & Compliance Module
- Organized into 5 tabs: Compliance, SSO, RBAC, Moderation, Audit Logs.
- **Compliance**: PII Protection, Zero Retention Policy, Consent Management, GDPR Controls, Data Masking, Data Retention.
- **SSO**: Supports SAML, OIDC, Azure AD, Okta, Google.
- **RBAC**: Multi-Factor Authentication, password policies, session policies, IP restrictions.
- **Moderation**: Content rules for profanity, spam, hate speech.
- **Audit Logs**: Searchable and filterable log table.

## External Dependencies

### UI Libraries
- **Radix UI**: Accessible, unstyled component primitives.
- **Lucide React**: Icon library.
- **Recharts**: Charting library.
- **Embla Carousel**: Carousel component.
- **cmdk**: Command palette.
- **react-day-picker**: Date picker.
- **date-fns**: Date utility library.

### Form & Validation
- **React Hook Form**: Form handling.
- **Zod**: Schema validation.

### Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **class-variance-authority**: For variant-based component styles.
- **clsx**, **tailwind-merge**: Class name utilities.

### State & Data
- **@tanstack/react-query**: Async state management (available).
- **next-themes**: Theme persistence utilities.

### Testing
- **Vitest**: Test runner.
- **@testing-library/jest-dom**: DOM testing utilities.

### Build & Development
- **Vite**: Build tool.
- **TypeScript**: Type checking.
- **ESLint**: Linting.

### Transcripts Module
- **Purpose**: View, listen to, and manage conversation recordings across all channels
- **RBAC**: Added `transcripts` to ScreenId type. Client Admin has full access, Supervisor can view/export, Agent can view only. Configurable via Roles page.
- **Features**: Transcript listing with filters (channel, status, sentiment, has-recording), search, multi-select with bulk delete, per-transcript detail view with conversation timeline, audio player with play/pause/seek/skip/volume controls, export to text file, session metadata sidebar (details, summary, tags)
- **Data Hook**: `useTranscriptsData` manages transcripts array with filtering, deletion, multi-delete, and stats computation
- **Types**: `Transcript`, `TranscriptEntry`, `TranscriptChannel`, `TranscriptStatus`, `SentimentType` in `src/types/transcripts.ts`
- **Components**: `TranscriptsPage` at `/transcripts` route, protected by `ProtectedRoute` with `screenId="transcripts"`
- **Sidebar**: Listed under Insights group between Analytics and Surveys