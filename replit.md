# replit.md

## Overview

ConX is an enterprise AI platform designed as a single-page application (SPA) for managing conversational AI operations. It offers comprehensive tools for AI agent management, knowledge base creation, live operations monitoring, outbound calling campaigns, analytics, and team management. The platform features a robust role-based access control system for Client Admins, Supervisors, and Agents. The core vision is to provide "responsible intelligence" through an interactive prototype that maintains state without a backend.

The application serves as a frontend-only prototype, utilizing in-memory state management to demonstrate functionality and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application is built with React 18 and TypeScript, using Vite as the build tool. React Router handles client-side navigation with protected routes.

### UI/UX Decisions
- **Brand Identity**: ConX, tagline "responsible intelligence". Uses primary blue (#0094FF), primary green (#00FF7A), dark navy (#011B40), and dark (#000A17). Font is DM Sans. Logo files: conx-logo.jpg (light), conx-logo-dark.jpg (dark), conx-logomark.png (icon).
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

#### Flow Builder (Flows & Workflows) - Main USP
- Visual drag-and-drop canvas for designing conversational flows and backend workflow automations.
- **FlowType distinction**: `FlowType = 'flow' | 'workflow'` stored on each Flow/FlowSummary. Flows are conversational logic for rule-based agents; Workflows are backend automation processes.
- **Flow Nodes** (for conversational flows): Prompt nodes (Text Input, Name Input, Email Input, Phone Input, Date Input, Quick Reply), Message nodes (Message, Carousel), Logic (Condition), Action nodes (Execute Flow, Raise Ticket, AI Assistant, Transfer, DTMF, Delay, End), Safety & Risk (Safety Check).
- **Workflow Nodes** (for backend automation): Actions (API Call, Database, Function, Variable, Notification, Event Trigger), Logic (Condition, Delay), Integrations (WhatsApp, Slack, Telegram, Teams, Zendesk, Freshdesk, Zoho CRM, Salesforce, HubSpot), Safety & Risk (Safety Check).
- **Safety Check Node**: A risk checkpoint that acts as a "security guard" in conversation flows. Configurable checks include Sentiment Analysis (anger/frustration detection with low/medium/high thresholds), PII Detection (credit card, SSN, phone, email, address), Policy Violation checking, Profanity Filter, and Topic Guardrails (blocked topics). Configurable actions for high risk (transfer agent, escalate supervisor, send warning, end conversation), medium risk (continue with warning, transfer agent, log only), and PII detection (mask & continue, block & warn, transfer agent). Includes custom rules in natural language and audit logging toggle.
- **Node Categories**: `FLOW_NODE_CATEGORIES` and `WORKFLOW_NODE_CATEGORIES` in `src/types/flowBuilder.ts` control which nodes appear in the sidebar based on flowType.
- **NodeToolsSidebar**: Accepts `flowType` prop and dynamically shows appropriate node palette.
- **FlowListView**: Type filter tabs (All/Flows/Workflows), type badges (GitBranch for Flow, Zap for Workflow), two-step creation (select type → fill details).
- **NodePropertiesPanel**: Property forms for all 30+ node types including text inputs, quick replies, database operations, function code, variables, notifications, event triggers.
- Features an environment selector (Staging, Sandbox, Production) and a category sidebar for flow organization.
- The Test Panel supports Chat and Voice modes, simulating various node functionalities and providing test statistics.

#### Integrations & Channels (Merged Module)
- Unified "Integrations & Channels" page with category sidebar and grouped card grid.
- Covers 27 integrations across 7 categories: CRM (4), Voice (5), Messaging (6), Email (4), Chat Widget (1), LiveChat (4), Payments (3).
- **Channel connectors merged**: All Voice (Twilio, Vonage, Genesys Cloud, Asterisk/FreePBX, Amazon Connect), Messaging (WhatsApp, Slack, Telegram, Teams, Facebook Messenger, Instagram Direct), and Email (SendGrid, Amazon SES, Mailgun, Custom SMTP) connectors integrated as integration cards.
- **Chat Widget**: Special integration card with 5-tab configuration panel (Appearance, Bot Icon, Settings, Navigation, Deploy) accessible directly from the Integrations page.
- **IntegrationDetailView**: Supports text, password, select, and number field types for connector configuration.
- Each integration includes configuration fields, setup instructions, and connection management.
- **Channels page removed**: `/channels` route and sidebar entry removed; all channel functionality lives in Integrations.
- **Types**: `Integration`, `IntegrationCategory` (includes 'voice' | 'messaging' | 'email' | 'chat_widget') in `src/types/integrations.ts`
- **Data Hook**: `useIntegrationsData` manages all integrations including channel connectors and chat widget config.

#### Outbound Campaigns (Yellow.ai-style Campaign Management)
- **Campaign List View**: Dashboard with stats cards (total, running, scheduled, completed), filterable/searchable campaign table with status badges, channel icons, audience counts, and progress bars
- **Campaign Channels**: Supports Voice, WhatsApp, SMS, and Email outbound campaigns
- **Create Campaign Wizard**: Simplified 3-step wizard: Basic Info (name, description, channel) → Flow & Workflow Selection (searchable dropdowns for conversational flows and automation workflows from Flow Builder) → Review & Launch
- **Campaign Detail View**: Campaign header with status controls (pause/resume/launch), progress stats bar, tabbed content (Leads tab with filtering/search, Analytics tab with sentiment analysis, call outcomes, and campaign performance metrics)
- **Lead Management**: Lead cards with status, sentiment, call attempts, duration, escalation; Lead upload modal with drag-and-drop file upload; Escalate to human agent modal
- **Types**: `Campaign`, `CampaignTemplate`, `CampaignSegment`, `CampaignSchedule`, `CampaignGoal`, `CreateCampaignData` in `src/types/outboundCalling.ts`
- **Data Hook**: `useOutboundCallingData` manages campaigns array, templates, segments, leads, with CRUD operations and mock data
- **Components**: `CampaignListView`, `CreateCampaignWizard`, `CampaignDetailView`, `LeadCard`, `LeadUploadModal`, `EscalateLeadModal` in `src/components/outboundCalling/`

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