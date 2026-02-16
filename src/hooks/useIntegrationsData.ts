import { useState, useCallback } from 'react';
import type { Integration, APIKey, WebhookEndpoint, IntegrationStatus } from '@/types/integrations';
import type { ChatWidgetConfig } from '@/types/channels';

const mockIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Integrate with Salesforce CRM to manage contacts, leads, opportunities, and cases directly through your conversational workflows.',
    category: 'crm',
    icon: 'salesforce',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-25T11:00:00Z',
    lastSync: '2025-02-02T07:45:00Z',
    features: ['Contacts', 'Leads', 'Opportunities', 'Cases'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'instance_url', label: 'Instance URL', type: 'url', placeholder: 'https://your-instance.salesforce.com', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to your Salesforce account and navigate to Setup > Apps > App Manager.' },
      { step: 2, text: 'Click New Connected App, fill in the required details (name, API name, contact email).' },
      { step: 3, text: 'Enable OAuth Settings, add the required scopes, and save. Copy the Client ID and Client Secret.' },
      { step: 4, text: 'Paste your Instance URL, Client ID, and Client Secret in the fields on the left, then click Connect.' },
    ],
    docsUrl: 'https://developer.salesforce.com/docs',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Integrate with HubSpot CRM to customize lead details through your conversational experiences.',
    category: 'crm',
    icon: 'hubspot',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Contacts', 'Deals', 'Marketing', 'Automation'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'HubSpot API Key', required: true },
      { key: 'portal_id', label: 'Portal ID', type: 'text', placeholder: 'Portal ID', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to your HubSpot account and go to Settings > Integrations > API Key.' },
      { step: 2, text: 'Generate a new API key or copy the existing one.' },
      { step: 3, text: 'Find your Portal ID in Settings > Account Defaults.' },
      { step: 4, text: 'Enter the API Key and Portal ID, then click Connect.' },
    ],
    docsUrl: 'https://developers.hubspot.com/docs',
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    description: 'Integrate with Zoho CRM to power your conversations with lead and contact management.',
    category: 'crm',
    icon: 'zoho',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Contacts', 'Leads', 'Deals', 'Activities'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Zoho API Console at api-console.zoho.com.' },
      { step: 2, text: 'Create a Server-based Application and copy the Client ID and Secret.' },
      { step: 3, text: 'Enter the credentials and click Connect.' },
    ],
  },
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics 365',
    description: 'Integrate with Microsoft Dynamics 365 CRM & ERP system to power your conversational workflows.',
    category: 'crm',
    icon: 'dynamics',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Sales', 'Customer Service', 'Marketing', 'Field Service'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'tenant_id', label: 'Tenant ID', type: 'text', placeholder: 'Azure AD Tenant ID', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Application Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
      { key: 'instance_url', label: 'Instance URL', type: 'url', placeholder: 'https://your-org.crm.dynamics.com', required: true },
    ],
    instructions: [
      { step: 1, text: 'Register an application in Azure Active Directory.' },
      { step: 2, text: 'Grant Dynamics CRM permissions to the application.' },
      { step: 3, text: 'Generate a Client Secret and copy the Tenant ID and Client ID.' },
      { step: 4, text: 'Enter all credentials and your Dynamics instance URL, then click Connect.' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Programmable voice platform for inbound and outbound calling with IVR, call recording, and real-time transcription.',
    category: 'voice',
    icon: 'twilio',
    status: 'connected',
    authType: 'api_key',
    connectedAt: '2025-01-15T10:00:00Z',
    lastSync: '2025-02-02T08:30:00Z',
    features: ['Inbound calls', 'Outbound calls', 'IVR', 'Call recording', 'Transcription'],
    fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxx', required: true },
      { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: 'Auth Token', required: true },
      { key: 'phone_number', label: 'Phone Number', type: 'text', placeholder: '+1 (555) 000-0000', helpText: 'Your Twilio phone number for inbound/outbound calls' },
      { key: 'region', label: 'Region', type: 'select', options: [{ value: 'us1', label: 'US (Virginia)' }, { value: 'ie1', label: 'EU (Ireland)' }, { value: 'au1', label: 'AU (Sydney)' }] },
    ],
    instructions: [
      { step: 1, text: 'Log in to Twilio Console at console.twilio.com.' },
      { step: 2, text: 'Copy the Account SID and Auth Token from the dashboard.' },
      { step: 3, text: 'Enter both values and click Connect.' },
    ],
    docsUrl: 'https://www.twilio.com/docs',
  },
  {
    id: 'vonage',
    name: 'Vonage',
    description: 'Enterprise voice APIs for SIP trunking, voice calls, and programmable communications.',
    category: 'voice',
    icon: 'vonage',
    status: 'disconnected',
    authType: 'api_key',
    features: ['SIP Trunking', 'Voice API', 'Call control', 'WebSocket streaming'],
    fields: [
      { key: 'api_key', label: 'API Key', type: 'text', placeholder: 'Vonage API Key', required: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'Vonage API Secret', required: true },
      { key: 'application_id', label: 'Application ID', type: 'text', placeholder: 'Application ID', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to the Vonage API Dashboard at dashboard.nexmo.com.' },
      { step: 2, text: 'Copy your API Key and API Secret from the Getting Started page.' },
      { step: 3, text: 'Create a Voice Application and copy the Application ID.' },
      { step: 4, text: 'Enter the credentials and click Connect.' },
    ],
    docsUrl: 'https://developer.vonage.com/en/voice/voice-api/overview',
  },
  {
    id: 'genesys',
    name: 'Genesys Cloud',
    description: 'Cloud contact center platform for voice routing, agent management, and workforce optimization.',
    category: 'voice',
    icon: 'genesys',
    status: 'disconnected',
    authType: 'oauth',
    features: ['ACD routing', 'Agent desktop', 'Workforce management', 'Quality management'],
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret', required: true },
      { key: 'region', label: 'Region', type: 'select', options: [{ value: 'mypurecloud.com', label: 'Americas' }, { value: 'mypurecloud.ie', label: 'EMEA' }, { value: 'mypurecloud.com.au', label: 'APAC' }] },
    ],
    instructions: [
      { step: 1, text: 'Log in to Genesys Cloud and go to Admin > Integrations > OAuth.' },
      { step: 2, text: 'Create a new OAuth client with Client Credentials grant type.' },
      { step: 3, text: 'Assign the required roles and copy the Client ID and Secret.' },
      { step: 4, text: 'Enter the credentials with your region and click Connect.' },
    ],
    docsUrl: 'https://developer.genesys.cloud/',
  },
  {
    id: 'five9',
    name: 'Five9',
    description: 'Intelligent cloud contact center with AI-powered voice automation and predictive dialing.',
    category: 'voice',
    icon: 'five9',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Predictive dialing', 'IVR', 'Call recording', 'Agent scripting'],
    fields: [
      { key: 'username', label: 'API Username', type: 'text', placeholder: 'API username', required: true },
      { key: 'password', label: 'API Password', type: 'password', placeholder: 'API password', required: true },
    ],
    instructions: [
      { step: 1, text: 'Contact your Five9 administrator to get API access credentials.' },
      { step: 2, text: 'Ensure your user role has Web Services API permissions.' },
      { step: 3, text: 'Enter the API username and password, then click Connect.' },
    ],
    docsUrl: 'https://developer.five9.com/',
  },
  {
    id: 'asterisk',
    name: 'Asterisk / FreePBX',
    description: 'Open-source PBX system for on-premise voice infrastructure and SIP-based communications.',
    category: 'voice',
    icon: 'asterisk',
    status: 'disconnected',
    authType: 'api_key',
    features: ['On-premise PBX', 'SIP trunking', 'Call routing', 'AMI control'],
    fields: [
      { key: 'server_url', label: 'Server URL', type: 'url', placeholder: 'https://pbx.example.com', required: true },
      { key: 'ami_user', label: 'AMI Username', type: 'text', placeholder: 'AMI username', required: true },
      { key: 'ami_password', label: 'AMI Password', type: 'password', placeholder: 'AMI password', required: true },
      { key: 'ami_port', label: 'AMI Port', type: 'number', placeholder: '5038' },
    ],
    instructions: [
      { step: 1, text: 'Access your Asterisk/FreePBX server administration panel.' },
      { step: 2, text: 'Enable the Asterisk Manager Interface (AMI) in manager.conf.' },
      { step: 3, text: 'Create an AMI user with appropriate permissions.' },
      { step: 4, text: 'Enter the server URL, AMI credentials, and port, then click Connect.' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Official WhatsApp Business API for customer messaging, templates, and media sharing.',
    category: 'messaging',
    icon: 'whatsapp',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-20T14:00:00Z',
    lastSync: '2025-02-02T09:15:00Z',
    features: ['Messaging', 'Templates', 'Media sharing', 'Business profile'],
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: 'Phone Number ID', required: true },
      { key: 'business_account_id', label: 'Business Account ID', type: 'text', placeholder: 'Business Account ID', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Permanent Access Token', required: true, helpText: 'Permanent token from Meta Business Suite' },
    ],
    instructions: [
      { step: 1, text: 'Go to Meta for Developers and select your WhatsApp Business app.' },
      { step: 2, text: 'Copy the Phone Number ID and generate a Permanent Access Token.' },
      { step: 3, text: 'Enter both and click Connect.' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Workspace messaging platform for team collaboration, notifications, and workflow automation.',
    category: 'messaging',
    icon: 'slack',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-10T09:00:00Z',
    lastSync: '2025-02-02T10:00:00Z',
    features: ['Messages', 'Channels', 'Notifications', 'File sharing'],
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...', required: true },
      { key: 'signing_secret', label: 'Signing Secret', type: 'password', placeholder: 'Signing Secret', required: true },
      { key: 'app_id', label: 'App ID', type: 'text', placeholder: 'App ID' },
    ],
    instructions: [
      { step: 1, text: 'Go to api.slack.com/apps and create a new app.' },
      { step: 2, text: 'Install the app to your workspace and copy the Bot Token.' },
      { step: 3, text: 'Copy the Signing Secret from the Basic Information page.' },
      { step: 4, text: 'Enter the Bot Token and Signing Secret, then click Connect.' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Cloud-based messaging app with bot API support for automated conversations.',
    category: 'messaging',
    icon: 'telegram',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Bot messaging', 'Inline queries', 'Groups', 'Channels'],
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'Enter BotFather token', required: true, helpText: 'Get this from @BotFather on Telegram' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', placeholder: 'Auto-generated after connection', helpText: 'Auto-generated after connection' },
    ],
    instructions: [
      { step: 1, text: 'Open Telegram and message @BotFather to create a new bot.' },
      { step: 2, text: 'Follow the prompts to set your bot name and username.' },
      { step: 3, text: 'Copy the Bot Token provided by BotFather.' },
      { step: 4, text: 'Enter the Bot Token and click Connect.' },
    ],
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    description: 'Enterprise messaging and collaboration platform for team communication and video calls.',
    category: 'messaging',
    icon: 'microsoft_teams',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Messages', 'Channels', 'Video calls', 'File sharing'],
    fields: [
      { key: 'app_id', label: 'App ID', type: 'text', placeholder: 'Application Client ID', required: true },
      { key: 'app_password', label: 'App Password', type: 'password', placeholder: 'App Password', required: true },
      { key: 'tenant_id', label: 'Tenant ID', type: 'text', placeholder: 'Azure AD Tenant ID', helpText: 'Azure AD tenant ID' },
    ],
    instructions: [
      { step: 1, text: 'Register an app in Azure AD with Microsoft Graph permissions.' },
      { step: 2, text: 'Configure Teams-specific API permissions (Channel.ReadBasic.All, Chat.ReadWrite).' },
      { step: 3, text: 'Generate a Client Secret and copy the Tenant ID and Client ID.' },
      { step: 4, text: 'Enter credentials and click Connect.' },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description: 'Meta Messenger platform for customer engagement and automated conversations.',
    category: 'messaging',
    icon: 'facebook',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Messaging', 'Quick replies', 'Templates', 'Media'],
    fields: [
      { key: 'page_access_token', label: 'Page Access Token', type: 'password', placeholder: 'Page Access Token', required: true },
      { key: 'page_id', label: 'Page ID', type: 'text', placeholder: 'Facebook Page ID', required: true },
      { key: 'app_secret', label: 'App Secret', type: 'password', placeholder: 'App Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Meta for Developers and create or select your app.' },
      { step: 2, text: 'Add the Messenger product and link your Facebook Page.' },
      { step: 3, text: 'Generate a Page Access Token and copy the App Secret.' },
      { step: 4, text: 'Enter the credentials and click Connect.' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'Instagram messaging for business communications and customer support.',
    category: 'messaging',
    icon: 'instagram',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Direct messages', 'Story replies', 'Quick replies', 'Media sharing'],
    fields: [
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Instagram Access Token', required: true },
      { key: 'ig_account_id', label: 'Instagram Account ID', type: 'text', placeholder: 'Instagram Account ID', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Meta for Developers and connect your Instagram Professional account.' },
      { step: 2, text: 'Enable the Instagram Messaging API for your app.' },
      { step: 3, text: 'Generate an access token and copy your Instagram Account ID.' },
      { step: 4, text: 'Enter the credentials and click Connect.' },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Twilio SendGrid email delivery and marketing platform for transactional and promotional emails.',
    category: 'email',
    icon: 'sendgrid',
    status: 'connected',
    authType: 'api_key',
    connectedAt: '2025-01-18T10:00:00Z',
    lastSync: '2025-02-02T09:00:00Z',
    features: ['Transactional email', 'Marketing campaigns', 'Templates', 'Analytics'],
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'SG.xxxxxxxxxx', required: true },
      { key: 'from_email', label: 'From Email', type: 'text', placeholder: 'noreply@company.com', required: true },
      { key: 'from_name', label: 'From Name', type: 'text', placeholder: 'Company Support' },
    ],
    instructions: [
      { step: 1, text: 'Log in to SendGrid and go to Settings > API Keys.' },
      { step: 2, text: 'Create a new API key with the required permissions.' },
      { step: 3, text: 'Enter the API key and sender details, then click Connect.' },
    ],
    docsUrl: 'https://docs.sendgrid.com/',
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    description: 'Amazon Simple Email Service for high-volume, cost-effective email sending.',
    category: 'email',
    icon: 'ses',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Bulk email', 'Transactional email', 'Templates', 'Deliverability'],
    fields: [
      { key: 'access_key_id', label: 'Access Key ID', type: 'text', placeholder: 'AWS Access Key ID', required: true },
      { key: 'secret_access_key', label: 'Secret Access Key', type: 'password', placeholder: 'AWS Secret Access Key', required: true },
      { key: 'region', label: 'AWS Region', type: 'select', options: [{ value: 'us-east-1', label: 'US East (N. Virginia)' }, { value: 'us-west-2', label: 'US West (Oregon)' }, { value: 'eu-west-1', label: 'EU (Ireland)' }] },
      { key: 'from_email', label: 'Verified From Email', type: 'text', placeholder: 'noreply@company.com', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to AWS Console and navigate to SES.' },
      { step: 2, text: 'Verify your sending domain or email address.' },
      { step: 3, text: 'Create an IAM user with SES permissions and copy the credentials.' },
      { step: 4, text: 'Enter the credentials and click Connect.' },
    ],
    docsUrl: 'https://docs.aws.amazon.com/ses/',
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Email API service for transactional and bulk email with powerful deliverability tools.',
    category: 'email',
    icon: 'mailgun',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Email API', 'SMTP relay', 'Email validation', 'Analytics'],
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Mailgun API Key', required: true },
      { key: 'domain', label: 'Domain', type: 'text', placeholder: 'mg.example.com', required: true },
      { key: 'from_email', label: 'From Email', type: 'text', placeholder: 'noreply@example.com', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Mailgun and go to Settings > API Keys.' },
      { step: 2, text: 'Copy your Private API key.' },
      { step: 3, text: 'Add and verify your sending domain.' },
      { step: 4, text: 'Enter the API key, domain, and sender, then click Connect.' },
    ],
    docsUrl: 'https://documentation.mailgun.com/',
  },
  {
    id: 'smtp',
    name: 'Custom SMTP',
    description: 'Connect any SMTP-compatible email server for full control over email delivery.',
    category: 'email',
    icon: 'smtp',
    status: 'disconnected',
    authType: 'api_key',
    features: ['SMTP relay', 'Custom server', 'TLS/SSL', 'Authentication'],
    fields: [
      { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.example.com', required: true },
      { key: 'port', label: 'Port', type: 'number', placeholder: '587', required: true },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'SMTP username', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: 'SMTP password', required: true },
      { key: 'encryption', label: 'Encryption', type: 'select', options: [{ value: 'tls', label: 'TLS' }, { value: 'ssl', label: 'SSL' }, { value: 'none', label: 'None' }] },
    ],
    instructions: [
      { step: 1, text: 'Gather your SMTP server details from your email provider.' },
      { step: 2, text: 'Enter the host, port, username, and password.' },
      { step: 3, text: 'Select the appropriate encryption method and click Connect.' },
    ],
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Integrate with Intercom for live chat, product tours, and customer engagement.',
    category: 'live_chat',
    icon: 'intercom',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-20T14:00:00Z',
    lastSync: '2025-02-02T08:45:00Z',
    features: ['Conversations', 'Contacts', 'Articles', 'Product Tours'],
    fields: [
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Intercom Access Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Intercom Developer Hub and create a new app.' },
      { step: 2, text: 'Generate an Access Token with the required permissions.' },
      { step: 3, text: 'Enter the Access Token and click Connect.' },
    ],
  },
  {
    id: 'zendesk_chat',
    name: 'Zendesk Chat',
    description: 'Live chat solution for real-time customer support with agent routing and chat analytics.',
    category: 'live_chat',
    icon: 'zendesk_chat',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Live chat', 'Chat routing', 'Triggers', 'Analytics'],
    fields: [
      { key: 'subdomain', label: 'Subdomain', type: 'text', placeholder: 'your-company', required: true },
      { key: 'api_token', label: 'API Token', type: 'password', placeholder: 'Zendesk API Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Zendesk and go to Admin > Channels > API.' },
      { step: 2, text: 'Enable Token Access and generate a new API token.' },
      { step: 3, text: 'Enter your subdomain and API token, then click Connect.' },
    ],
  },
  {
    id: 'livechat',
    name: 'LiveChat',
    description: 'Customer service platform with live chat, ticketing, and customer engagement tools.',
    category: 'live_chat',
    icon: 'livechat',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Live chat', 'Ticketing', 'Canned responses', 'Chat surveys'],
    fields: [
      { key: 'license_id', label: 'License ID', type: 'text', placeholder: 'License ID', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Personal Access Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to LiveChat and go to Settings > Chat Widget > Developer console.' },
      { step: 2, text: 'Create a new app and generate a Personal Access Token.' },
      { step: 3, text: 'Copy your License ID from the account settings.' },
      { step: 4, text: 'Enter the License ID and Access Token, then click Connect.' },
    ],
  },
  {
    id: 'freshchat',
    name: 'Freshchat',
    description: 'Modern messaging platform for sales, marketing, and support with AI-powered chatbots.',
    category: 'live_chat',
    icon: 'freshchat',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Messaging', 'Chatbots', 'Campaigns', 'IntelliAssign'],
    fields: [
      { key: 'domain', label: 'Domain', type: 'url', placeholder: 'https://your-company.freshchat.com', required: true },
      { key: 'api_token', label: 'API Token', type: 'password', placeholder: 'Freshchat API Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Freshchat and go to Settings > API Tokens.' },
      { step: 2, text: 'Generate a new API token and copy it.' },
      { step: 3, text: 'Enter your Freshchat domain and API token, then click Connect.' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions with Stripe payment processing.',
    category: 'payment',
    icon: 'stripe',
    status: 'connected',
    authType: 'api_key',
    connectedAt: '2025-01-12T14:00:00Z',
    lastSync: '2025-02-02T09:30:00Z',
    features: ['Payments', 'Subscriptions', 'Invoices', 'Refunds'],
    fields: [
      { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to your Stripe Dashboard and go to Developers > API Keys.' },
      { step: 2, text: 'Copy the Publishable Key and Secret Key.' },
      { step: 3, text: 'Paste both keys and click Connect.' },
    ],
    docsUrl: 'https://stripe.com/docs/api',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Accept payments in India with Razorpay payment gateway integration.',
    category: 'payment',
    icon: 'razorpay',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Payments', 'Subscriptions', 'Payouts', 'Smart Collect'],
    fields: [
      { key: 'key_id', label: 'Key ID', type: 'text', placeholder: 'rzp_live_...', required: true },
      { key: 'key_secret', label: 'Key Secret', type: 'password', placeholder: 'Key Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Razorpay Dashboard and go to Account & Settings > API Keys.' },
      { step: 2, text: 'Generate a new key pair and copy the Key ID and Key Secret.' },
      { step: 3, text: 'Enter both and click Connect.' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept global payments with PayPal for a seamless checkout experience.',
    category: 'payment',
    icon: 'paypal',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Payments', 'Payouts', 'Subscriptions', 'Disputes'],
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'PayPal Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'PayPal Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to developer.paypal.com and create an app.' },
      { step: 2, text: 'Copy the Client ID and Secret from the app details.' },
      { step: 3, text: 'Enter credentials and click Connect.' },
    ],
  },
];

const mockAPIKeys: APIKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'sk_live_xxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-02-02T10:30:00Z',
    permissions: ['read', 'write', 'delete'],
    isActive: true,
  },
  {
    id: 'key-2',
    name: 'Development API Key',
    key: 'sk_test_xxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-01-15T00:00:00Z',
    lastUsed: '2025-02-01T14:20:00Z',
    permissions: ['read', 'write'],
    isActive: true,
  },
  {
    id: 'key-3',
    name: 'Mobile App Key',
    key: 'sk_mobile_xxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-01-20T00:00:00Z',
    permissions: ['read'],
    isActive: false,
  },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: 'wh-1',
    name: 'Conversation Events',
    url: 'https://api.example.com/webhooks/conversations',
    events: ['conversation.started', 'conversation.ended', 'message.received'],
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
    lastTriggered: '2025-02-02T09:45:00Z',
  },
  {
    id: 'wh-2',
    name: 'Ticket Updates',
    url: 'https://api.example.com/webhooks/tickets',
    events: ['ticket.created', 'ticket.updated', 'ticket.resolved'],
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    lastTriggered: '2025-02-02T08:30:00Z',
  },
];

const defaultChatWidgetConfig: ChatWidgetConfig = {
  appearance: {
    botLogo: '',
    botDisplayName: 'ConX Assistant',
    botDescription: 'AI-powered support assistant',
    theme: 'light',
    brandColor1: '#0094FF',
    brandColor2: '#00FF7A',
    colorMode: 'solid',
    complementaryColor: '#0094FF',
    accentColor: '#0094FF',
    fontStyle: 'default',
    fontSize: 'medium',
    widgetSize: 'medium',
    position: 'bottom-right',
    initialStateDesktop: 'minimized',
    initialStateMobile: 'minimized',
  },
  botIcon: {
    shape: 'circle',
    mobileShape: 'circle',
    source: 'avatar',
    animation: 'none',
  },
  settings: {
    autoComplete: true,
    messageFeedback: true,
    attachment: true,
    slowMessages: true,
    multilineInput: false,
    languageSwitcher: false,
    rtlSupport: false,
    scrollBehavior: 'bottom',
    chatHistory: true,
    freshSessionPerTab: false,
    downloadTranscript: true,
    unreadBadge: true,
    browserTabNotification: true,
    messageSound: true,
    speechToText: false,
    textToSpeech: false,
    autoSendSpeech: false,
  },
  navigation: {
    homeEnabled: true,
    menuEnabled: false,
    menuItems: [],
  },
  deployScript: `<script type="text/javascript">
  window.ymConfig = {
    bot: 'x1234567890',
    host: 'https://cloud.yellow.ai'
  };
  (function() {
    var w = window, ic = w.YellowMessenger;
    if ("function" === typeof ic) ic("reattach_activator"),
    ic("update", w.ymConfig);
    else {
      var d = document, i = function() {
        i.c(arguments)
      };
      i.q = []; i.c = function(args) { i.q.push(args) };
      w.YellowMessenger = i;
      var l = function() {
        var s = d.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js";
        var x = d.getElementsByTagName("script")[0];
        x.parentNode.insertBefore(s, x);
      };
      w.attachEvent ? w.attachEvent("onload", l) : w.addEventListener("load", l, false);
    }
  })();
</script>`,
};

export function useIntegrationsData() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [chatWidgetConfig, setChatWidgetConfig] = useState<ChatWidgetConfig>(defaultChatWidgetConfig);
  const [isSavingWidget, setIsSavingWidget] = useState(false);

  const connectIntegration = useCallback(async (integrationId: string, credentials?: Record<string, string>): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Math.random() > 0.9) {
      return { success: false, error: 'Failed to authenticate. Please check your credentials.' };
    }

    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? {
            ...int,
            status: 'connected' as IntegrationStatus,
            connectedAt: new Date().toISOString(),
            lastSync: new Date().toISOString(),
            settings: credentials,
          }
        : int
    ));
    return { success: true };
  }, []);

  const disconnectIntegration = useCallback(async (integrationId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? { ...int, status: 'disconnected' as IntegrationStatus, connectedAt: undefined, lastSync: undefined }
        : int
    ));
    return { success: true };
  }, []);

  const updateChatWidgetConfig = useCallback(async (updates: Partial<ChatWidgetConfig>) => {
    setIsSavingWidget(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setChatWidgetConfig(prev => {
      const merged = { ...prev };
      if (updates.appearance) merged.appearance = { ...prev.appearance, ...updates.appearance };
      if (updates.botIcon) merged.botIcon = { ...prev.botIcon, ...updates.botIcon };
      if (updates.settings) merged.settings = { ...prev.settings, ...updates.settings };
      if (updates.navigation) merged.navigation = { ...prev.navigation, ...updates.navigation };
      return merged;
    });
    setIsSavingWidget(false);
  }, []);

  const createAPIKey = useCallback(async (name: string, permissions: string[]): Promise<{ success: boolean; key?: APIKey }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name,
      key: `sk_${name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 22)}`,
      createdAt: new Date().toISOString(),
      permissions,
      isActive: true,
    };
    setApiKeys(prev => [...prev, newKey]);
    return { success: true, key: newKey };
  }, []);

  const revokeAPIKey = useCallback(async (keyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
  }, []);

  const toggleAPIKey = useCallback(async (keyId: string) => {
    setApiKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, isActive: !k.isActive } : k
    ));
  }, []);

  const createWebhook = useCallback(async (name: string, url: string, events: string[]): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWebhook: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      name,
      url,
      events,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setWebhooks(prev => [...prev, newWebhook]);
    return { success: true };
  }, []);

  return {
    integrations,
    apiKeys,
    webhooks,
    chatWidgetConfig,
    isSavingWidget,
    connectIntegration,
    disconnectIntegration,
    updateChatWidgetConfig,
    createAPIKey,
    revokeAPIKey,
    toggleAPIKey,
    createWebhook,
  };
}
