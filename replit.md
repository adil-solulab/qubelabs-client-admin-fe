# replit.md

## Overview

ConX is an enterprise AI platform designed as a single-page application (SPA) for managing conversational AI operations. It offers comprehensive tools for AI agent management, knowledge base creation, live operations monitoring, outbound calling campaigns, analytics, and team management. The platform features a robust role-based access control system. The core vision is to provide "responsible intelligence" through an interactive prototype that maintains state without a backend, focusing on demonstrating functionality and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application is a frontend-only prototype built with React 18 and TypeScript, using Vite as the build tool. React Router handles client-side navigation with protected routes.

### UI/UX Decisions
- **Brand Identity**: ConX, tagline "responsible intelligence", using a defined color palette (blue, green, navy, dark) and DM Sans font. Logo assets are provided.
- **Component Library**: `shadcn/ui` based on Radix UI, styled with Tailwind CSS and CSS variables for theming, adhering to atomic design principles.
- **Theming**: Supports light/dark/system modes with customizable UI elements.
- **Sidebar Navigation**: Grouped, collapsible navigation with role-based filtering.

### Technical Implementations
- **State Management**: Primarily in-memory using React hooks. `@tanstack/react-query` is available for async state.
- **Authentication & Authorization**: Custom `AuthContext` with role-based access control (Client Admin, Supervisor, Agent) for route guarding and action-level checks.
- **Notification System**: Centralized notifications using Sonner.
- **Form Handling**: React Hook Form with Zod for validation.

### Feature Specifications

#### Knowledge Base Multi-Source Architecture
Supports diverse data ingestion methods including file uploads (PDF, DOCX, TXT, MD, CSV, XLSX), URL scraping, sitemap discovery, and integrations with services like Salesforce, Confluence, Zendesk, Notion, SharePoint, Google Drive, AWS S3, ServiceNow, Freshdesk, and databases. Features auto-sync capabilities and a unified `AddSourceModal`.

#### AI Agents (Super Agent + Agent Architecture)
Implements a Super Agent (orchestrator) and specialized Agents (specialists) model. The Super Agent handles routing, welcome messages, and context, while specialized Agents manage domain-specific functions (sales, support, knowledge base). Agents are highly configurable with sections for Persona, Intent Understanding, Prompt Logic, Routing, and Guardrails.

#### Flow Builder (Flows & Workflows)
A visual drag-and-drop canvas for designing conversational flows (`flow`) and backend workflow automations (`workflow`).
- **Flow Nodes**: Include Prompt (Text, Name, Email, Phone, Date, Quick Reply), Message (Message, Carousel), Logic (Condition), Action (Execute Flow, Raise Ticket, AI Assistant, Transfer, DTMF, Delay, End), and Safety & Risk (Safety Check).
- **Workflow Nodes**: Include Actions (API Call, Database, Function, Variable, Notification, Event Trigger), Logic (Condition, Delay), Integrations (WhatsApp, Slack, Telegram, Teams, Zendesk, Freshdesk, Zoho CRM, Salesforce, HubSpot), and Safety & Risk (Safety Check).
- **Safety Check Node**: A comprehensive risk assessment node with configurable settings for Bot Type, Sentiment Analysis, PII Detection (8 types), Policy Violation (7 categories), Profanity Filter, Topic Guardrails, and Custom Rules. It offers various Risk Actions (Warn Then Escalate, Transfer, Mask, Block) and Audit Logging.
- Features an environment selector (Staging, Sandbox, Production) and a category sidebar for organization. A Test Panel supports Chat and Voice modes.

#### Integrations & Channels (Merged Module)
A unified page for managing 27 integrations across 7 categories: CRM, Voice, Messaging, Email, Chat Widget, LiveChat, Payments. All channel connectors (Voice, Messaging, Email) are now integrated as integration cards. A dedicated Chat Widget integration offers a 5-tab configuration panel. Each integration provides configuration fields and setup instructions.

#### Outbound Campaigns
Manages outbound calling campaigns (Voice, WhatsApp, SMS, Email) with a dashboard, filterable table, and a 3-step creation wizard (Basic Info → Flow & Workflow Selection → Review & Launch). Campaign details include status controls, progress stats, and tabs for Lead Management (upload, status, sentiment, escalation) and Analytics.

#### Analytics Module
Provides 7 sub-tabs: Overview, Channels, Sentiment & Speech, LLM Analytics, Transcription, Compliance, Campaigns. Tracks Outcome KPIs (Time Saved, Effort Saved, Conversion Rate, Engagement Rate, CSAT Score) with sparkline charts and detailed analytics across various aspects of the platform.

#### Live Operations (Enhanced with Voice Agent Inbox)
Real-time monitoring of conversations with auto-updating durations and simulated messages. Features chat categorization tabs (All, Active, Queued, Resolved, Missed), configurable SLA monitoring with breach alerts, stats cards, and an Agent Status Panel. Supervisors can monitor, whisper, barge-in, transfer, and resolve conversations.

**Voice Agent Inbox Features:**
- **Customer Info Sidebar**: Expandable right panel showing customer profile (phone, email, company, tier, LTV), interaction history, AI co-pilot suggestions (intent detection, reply suggestions, action recommendations, knowledge base tips), and editable notes. Toggle via panel button in header.
- **AI Co-Pilot Panel**: Real-time AI suggestions with confidence scores, organized by type (Intent, Reply, Action, Knowledge). Click to apply suggestions.
- **Post-Call Disposition**: Modal triggered on call end with outcome selection (Resolved, Follow Up, Escalated, Callback, Voicemail), call summary, tags, and optional follow-up date. Disposition data persisted in conversation state.
- **VoiceCallControls Component**: Unified voice control bar with Mute, Hold, Speaker, End Call buttons plus network quality indicator (Excellent/Good/Fair/Poor) and recording/transcript download buttons.
- **Enhanced Voice Data**: Conversations enriched with CustomerInfo, RecordingInfo, NetworkQuality, CoPilotSuggestions, and CallDisposition types.
- **Reusable Components**: CustomerInfoSidebar, PostCallDispositionModal, VoiceCallControls are standalone components used in both ConversationDetailPanel (Live Ops) and ActiveChatDetailPanel (Active Chats).

#### Users & Team Management (Enhanced with Groups)
Offers tabbed views for Users and Groups. The Users tab provides CRUD operations for user accounts, role management, agent status workflow (Available, Busy, Away, Offline), and concurrency control (`maxConcurrentChats`). The Groups tab enables creation and management of agent groups with supervisor assignment, agent members, working hours, and auto-assignment settings.

#### Security & Compliance Module
Organized into 5 tabs: Compliance (PII Protection, Zero Retention, Consent, GDPR, Data Masking, Retention), SSO (SAML, OIDC, Azure AD, Okta, Google), RBAC (MFA, password policies, session policies, IP restrictions), Moderation (content rules), and Audit Logs.

#### Transcripts Module
Allows viewing, listening to, and managing conversation recordings across all channels. Features a transcript listing with filters, search, multi-select bulk delete, a detailed view with timeline and audio player, export options, and session metadata. RBAC is implemented for Client Admin, Supervisor, and Agent roles.

#### Report Tickets Module
Enables agents to report/escalate conversations to Client Admins with comments. Admins can review, comment, and close tickets. Features a ticket list with filters, a detail view with comment threads, and stats cards. RBAC is implemented for Client Admin, Supervisor, and Agent roles.

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

### Build & Development
- **Vite**: Build tool.
- **TypeScript**: Type checking.
- **ESLint**: Linting.