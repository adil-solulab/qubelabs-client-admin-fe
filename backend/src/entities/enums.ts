export enum UserRole {
  CLIENT_ADMIN = 'client_admin',
  SUPERVISOR = 'supervisor',
  AGENT = 'agent',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum AgentStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  ON_BREAK = 'on_break',
  OFFLINE = 'offline',
}

export enum ChannelType {
  VOICE = 'voice',
  CHAT = 'chat',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  WEBCHAT = 'webchat',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  ABANDONED = 'abandoned',
}

export enum MessageSender {
  CUSTOMER = 'customer',
  AI_AGENT = 'ai_agent',
  HUMAN_AGENT = 'human_agent',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  TRANSFER = 'transfer',
}

export enum SentimentType {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

export enum FlowNodeType {
  PROMPT = 'prompt',
  MESSAGE = 'message',
  LOGIC = 'logic',
  ACTION = 'action',
  RUN_WORKFLOW = 'run_workflow',
  SAFETY_CHECK = 'safety_check',
  START = 'start',
  END = 'end',
}

export enum WorkflowNodeType {
  ACTION = 'action',
  LOGIC = 'logic',
  INTEGRATION = 'integration',
  MESSAGING = 'messaging',
  TICKETING = 'ticketing',
  CRM = 'crm',
  SAFETY_CHECK = 'safety_check',
  START = 'start',
  END = 'end',
}

export enum FlowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum EnvironmentType {
  STAGING = 'staging',
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
}

export enum CampaignType {
  VOICE = 'voice',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum LeadStatus {
  PENDING = 'pending',
  CALLED = 'called',
  ANSWERED = 'answered',
  NO_ANSWER = 'no_answer',
  BUSY = 'busy',
  FAILED = 'failed',
  VOICEMAIL = 'voicemail',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum IntegrationCategory {
  CRM = 'crm',
  VOICE = 'voice',
  MESSAGING = 'messaging',
  EMAIL = 'email',
  CHAT_WIDGET = 'chat_widget',
  LIVE_CHAT = 'live_chat',
  PAYMENT = 'payment',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

export enum AuthType {
  OAUTH = 'oauth',
  API_KEY = 'api_key',
  WEBHOOK = 'webhook',
}

export enum KnowledgeSourceType {
  FILE = 'file',
  URL = 'url',
  SITEMAP = 'sitemap',
  SALESFORCE = 'salesforce',
  CONFLUENCE = 'confluence',
  ZENDESK = 'zendesk',
  NOTION = 'notion',
  SHAREPOINT = 'sharepoint',
  GOOGLE_DRIVE = 'google_drive',
  AWS_S3 = 'aws_s3',
  SERVICE_NOW = 'service_now',
  FRESHDESK = 'freshdesk',
  DATABASE = 'database',
}

export enum SourceSyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SubscriptionPlan {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  TRIALING = 'trialing',
}

export enum InvoiceStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  FAILED = 'failed',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  ACCESS = 'access',
  SETTINGS_CHANGE = 'settings_change',
}

export enum SSOProvider {
  SAML = 'saml',
  OIDC = 'oidc',
  AZURE_AD = 'azure_ad',
  OKTA = 'okta',
  GOOGLE = 'google',
}

export enum VoiceGender {
  MALE = 'male',
  FEMALE = 'female',
  NEUTRAL = 'neutral',
}

export enum VoiceAge {
  CHILD = 'child',
  TEEN = 'teen',
  ADULT = 'adult',
  SENIOR = 'senior',
}

export enum VoiceAccent {
  EN_US = 'en-US',
  EN_GB = 'en-GB',
  EN_AU = 'en-AU',
  EN_IN = 'en-IN',
  ES_ES = 'es-ES',
  FR_FR = 'fr-FR',
  DE_DE = 'de-DE',
}

export enum VoiceStyle {
  CHEERFUL = 'cheerful',
  CALM = 'calm',
  PROFESSIONAL = 'professional',
  ENERGETIC = 'energetic',
  WHISPERY = 'whispery',
  FRIENDLY = 'friendly',
  AUTHORITATIVE = 'authoritative',
  EMPATHETIC = 'empathetic',
  WARM = 'warm',
  SERIOUS = 'serious',
  CASUAL = 'casual',
  CONFIDENT = 'confident',
}

export enum SpeakingRate {
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast',
  VERY_FAST = 'very_fast',
}

export enum VoiceClarity {
  SOFTENED = 'softened',
  BALANCED = 'balanced',
  CRISP = 'crisp',
}

export enum AssignmentType {
  AUTO = 'auto',
  MANUAL = 'manual',
  TRANSFER = 'transfer',
  ESCALATION = 'escalation',
}

export enum MetricCategory {
  OVERVIEW = 'overview',
  CHANNELS = 'channels',
  SENTIMENT = 'sentiment',
  LLM = 'llm',
  TRANSCRIPTION = 'transcription',
  COMPLIANCE = 'compliance',
  CAMPAIGNS = 'campaigns',
}

export enum PeriodType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum SDKPlatform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  REACT_NATIVE = 'react_native',
}

export enum SDKCategory {
  CHAT = 'chat',
  VOICE_WEBRTC = 'voice_webrtc',
}

export enum WidgetPosition {
  BOTTOM_RIGHT = 'bottom_right',
  BOTTOM_LEFT = 'bottom_left',
  TOP_RIGHT = 'top_right',
  TOP_LEFT = 'top_left',
}
