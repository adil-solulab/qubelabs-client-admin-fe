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
- **User Profile**: Redesigned account settings with tabs for Profile, Sessions, Security (including 2FA and security questions), and general Settings.
- **Dashboard**: Features a Credit Usage Widget and improved layout for deep-dive dialogs.

### Technical Implementations
- **State Management**: Primarily in-memory using React hooks. `@tanstack/react-query` is available for async state.
- **Authentication & Authorization**: Custom `AuthContext` with role-based access control (Client Admin, Supervisor, Agent) for route guarding and action-level checks.
- **Notification System**: Centralized notifications using Sonner.
- **Form Handling**: React Hook Form with Zod for validation.

### Feature Specifications

#### Knowledge Base Multi-Source Architecture
Supports diverse data ingestion methods including file uploads (PDF, DOCX, TXT, MD, CSV, XLSX), URL scraping, sitemap discovery, and integrations with services like Salesforce, Confluence, Zendesk, Notion, SharePoint, Google Drive, AWS S3, ServiceNow, Freshdesk, and databases. Features auto-sync capabilities and a unified `AddSourceModal`.

#### AI Agents (Super Agent + Agent Architecture)
Implements a Super Agent (orchestrator) and specialized Agents (specialists) model. Agents are highly configurable with sections for Persona, Intent Understanding, Prompt Logic, Routing, and Guardrails, including enhanced voice profile settings.
- **Comprehensive Voice Persona Settings**: Full voice identity controls (Gender: Male/Female/Neutral, Age: Child/Teen/Adult/Senior, Accent: 7 locale options, Style/Tone: 12 options including Cheerful, Calm, Professional, Energetic, Whispery, etc.). Voice Technical Settings (Pitch slider, Speaking Rate: Slow/Normal/Fast/Very Fast, Stability slider, Clarity: Softened/Balanced/Crisp). Emotions & Expressiveness (8 emotion options with strength slider, Expressiveness/Warmth/Breathiness sliders). Conversational Behavior (Pause Length, AI Fillers toggle, Interruptibility toggle, Fallback Tone). Voice Preview simulation with audio waveform animation. Custom pronunciation dictionary support. VoiceSettingsModal with 4 tabs: Tone & Style, Voice Profile, Audio Controls, Behavior.
- **Voice Settings Section**: ElevenLabs-style slider controls with detailed descriptions for Stability (consistency vs expressiveness), Speed (speech rate control), and Similarity (clarity and voice consistency). Each slider includes descriptive help text in card-style UI.
- **Call Settings Section**: Comprehensive call configuration including Maximum Call Duration dropdown (2-60 minutes), Inactivity Duration dropdown (5-60 seconds), Timezone selector, and 8 toggle switches: Noise Filtering, Voicemail Detection, Leave Voicemail Message, Retry Call, Silence Callee During Introduction, Silence Callee When Speaking, Enable Background Audio, Enable Graceful Exit Warning. Settings are persisted via `CallSettings` type on the AIAgent model.

#### Flow Builder (Flows & Workflows)
A visual drag-and-drop canvas for designing conversational flows (`flow`) and backend workflow automations (`workflow`).
- **Separated Builders**: Distinct interfaces for Flow Builder and Workflow Builder.
- **Flow Nodes**: Includes Prompt, Message, Logic, Action (including Run Workflow), and Safety & Risk (Safety Check).
- **Run Workflow Node**: Allows flows to call backend workflows. Features WorkflowSelectionModal for selecting existing workflows or creating new ones, displays workflow output variables (e.g., `{{workflow.booking_id}}`), supports "Change Workflow" from properties panel. Output variables are available as clickable tokens in downstream Message node editors. Creating a new workflow from within a flow stores a return target; after publishing the workflow, a "Return to Flow" prompt appears.
- **Workflow Nodes**: Includes Actions, Logic, Integrations (Messaging, Ticketing, CRM), and Safety & Risk (Safety Check).
- **Safety Check Node**: Comprehensive risk assessment with configurable settings for Bot Type, Sentiment Analysis, PII Detection, Policy Violation, Profanity Filter, Topic Guardrails, and Custom Rules, offering various Risk Actions and Audit Logging.
- Features an environment selector (Staging, Sandbox, Production) and a category sidebar. A Test Panel supports Chat and Voice modes.

#### SDKs & Deployment Module
Multi-platform SDK management supporting 4 platforms (Web, iOS, Android, React Native) and 2 SDK categories (Chat SDK, Voice WebRTC SDK) with 8 total SDK entries. Features 3 tabs: SDKs (category-grouped cards with install commands, versions, docs links, language badges), Embed Widgets (chat and WebRTC widget embed code generation), and API Keys (publishable/secret key management with visibility toggle, regeneration). Voice WebRTC SDK includes an inline "Configure Widget" view (WebRTCConfigurator component) with 4 config tabs: Appearance (button text, position, style, size, color presets, pulse animation, theme, border radius, font), Behavior (mute/speaker/hold/duration/network quality toggles, max call duration slider), Security (domain restrictions), and Embed Code (HTML snippet, React/Next.js component, npm install, SDK events reference). Includes interactive live preview with simulated call states and integration stats.

#### Integrations & Channels (Merged Module)
A unified page for managing 27 integrations across 7 categories: CRM, Voice, Messaging, Email, Chat Widget, LiveChat, Payments. Features a professional sidebar with category navigation (with connected-count indicators), search, and grid/list view toggle. Integration cards display connection status, feature tags, and hover effects. Includes a dedicated Chat Widget integration with a 5-tab configuration panel. API Keys and Webhooks management has been removed from this page.

#### Outbound Campaigns
Manages outbound calling campaigns (Voice, WhatsApp, SMS, Email) with a dashboard, filterable table, and a 3-step creation wizard (Basic Info → Lead Source / Flow & Workflow → Review & Launch). The wizard includes a lead source selector in Step 1 with two options: CSV/Excel file upload (.csv and .xls only) or Flow/Workflow selection. Step 2 adapts based on the chosen lead source. Features enhanced lead upload with CSV mapping, file type validation, and refined voice settings modal.

#### Analytics Module
Provides 7 sub-tabs: Overview, Channels, Sentiment & Speech, LLM Analytics, Transcription, Compliance, Campaigns. Tracks Outcome KPIs (Time Saved, Effort Saved, Conversion Rate, Engagement Rate, CSAT Score) with sparkline charts and detailed analytics.

#### Live Operations (Enhanced with Voice Agent Inbox + Role-Based Views)
Real-time monitoring of conversations with auto-updating durations and simulated messages. Features chat categorization tabs, configurable SLA monitoring with breach alerts, stats cards, and an Agent Status Panel.
- **Role-Based UI Separation**: Supervisors/Client Admins have full team visibility and controls (Monitor, Whisper, Barge In, Transfer); Agents see only their assigned conversations with simplified controls.
- **Voice Agent Inbox Features**: Customer Info Sidebar (customer profile, interaction history, AI co-pilot suggestions, notes), AI Co-Pilot Panel (real-time AI suggestions with confidence scores, including an interactive Co-Pilot Chat), Post-Call Disposition, and VoiceCallControls (mute, hold, speaker, end call, network quality, recording/transcript download).

#### Users & Team Management (Enhanced with Groups)
Offers tabbed views for Users and Groups. The Users tab provides CRUD operations for user accounts, role management, agent status workflow, and concurrency control. The Groups tab enables creation and management of agent groups with supervisor assignment, agent members, working hours, and auto-assignment settings.

#### Billing & Subscription
Professional redesigned billing page with 4 plan tiers: Starter ($49/mo), Pro ($199/mo), Enterprise ($499/mo), and Custom (contact sales). Features auto-renew toggle, credits balance display, usage metrics with progress bars, payment methods management, and invoice history. Custom plan opens a contact sales modal form instead of direct upgrade. Plan types: 'starter' | 'pro' | 'enterprise' | 'custom'.

#### Security & Compliance Module
Organized into 5 tabs: Compliance (PII Protection, Zero Retention, Consent, GDPR, Data Masking, Retention), SSO (SAML, OIDC, Azure AD, Okta, Google), RBAC (MFA, password policies, session policies, IP restrictions), Moderation (content rules), and Audit Logs. Data retention includes backup validation ensuring backup retention always exceeds conversation and log retention periods (auto-adjusts). RBI-compliant defaults: conversations 365 days, logs 365 days, backups 730 days.

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
- **react-phone-number-input**: International phone number input.

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