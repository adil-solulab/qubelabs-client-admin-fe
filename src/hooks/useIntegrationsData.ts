import { useState, useCallback } from 'react';
import type { Integration, APIKey, WebhookEndpoint, IntegrationStatus } from '@/types/integrations';

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
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Integrate with Freshdesk to manage support tickets and enhance customer service workflows.',
    category: 'itsm',
    icon: 'freshdesk',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Tickets', 'Contacts', 'Groups', 'Canned Responses'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'domain', label: 'Freshdesk Domain', type: 'url', placeholder: 'https://your-company.freshdesk.com', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Freshdesk API Key', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Freshdesk and click your profile picture > Profile Settings.' },
      { step: 2, text: 'Copy the API Key from the right sidebar.' },
      { step: 3, text: 'Enter your Freshdesk domain and API Key, then click Connect.' },
    ],
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'Integrate with ServiceNow to automate IT service management and incident resolution.',
    category: 'itsm',
    icon: 'servicenow',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-18T16:00:00Z',
    lastSync: '2025-02-02T08:00:00Z',
    features: ['Incidents', 'Service Requests', 'Change Management', 'Knowledge Base'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'instance_url', label: 'Instance URL', type: 'url', placeholder: 'https://your-instance.service-now.com', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Navigate to System OAuth > Application Registry in your ServiceNow instance.' },
      { step: 2, text: 'Create an OAuth API endpoint and copy the Client ID and Secret.' },
      { step: 3, text: 'Enter your instance URL and credentials, then click Connect.' },
    ],
  },
  {
    id: 'jira',
    name: 'Jira Service Management',
    description: 'Integrate with Jira to create and manage issues, track projects, and automate workflows.',
    category: 'itsm',
    icon: 'jira',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Issues', 'Projects', 'Boards', 'Sprints'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'site_url', label: 'Jira Site URL', type: 'url', placeholder: 'https://your-site.atlassian.net', required: true },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'your-email@company.com', required: true },
      { key: 'api_token', label: 'API Token', type: 'password', placeholder: 'Jira API Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to id.atlassian.com/manage-profile/security/api-tokens.' },
      { step: 2, text: 'Create a new API Token and copy it.' },
      { step: 3, text: 'Enter your Jira site URL, email, and API token, then click Connect.' },
    ],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Integrate with Zendesk to streamline ticket management and customer support operations.',
    category: 'itsm',
    icon: 'freshdesk',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-22T10:00:00Z',
    lastSync: '2025-02-02T09:00:00Z',
    features: ['Tickets', 'Users', 'Organizations', 'Macros'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
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
    id: 'bamboo',
    name: 'BambooHR',
    description: 'Integrate with BambooHR for employee data management, time-off requests, and onboarding.',
    category: 'hr',
    icon: 'bamboo',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Employee Directory', 'Time Off', 'Onboarding', 'Reports'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'subdomain', label: 'Subdomain', type: 'text', placeholder: 'your-company', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'BambooHR API Key', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to BambooHR and go to Account > API Keys.' },
      { step: 2, text: 'Generate a new API key and copy it.' },
      { step: 3, text: 'Enter your subdomain and API Key, then click Connect.' },
    ],
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'Integrate with Workday for HR management, payroll, and workforce analytics.',
    category: 'hr',
    icon: 'workday',
    status: 'disconnected',
    authType: 'oauth',
    features: ['HCM', 'Payroll', 'Recruiting', 'Learning'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'tenant_url', label: 'Tenant URL', type: 'url', placeholder: 'https://wd5-impl-services1.workday.com', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Register an API client in Workday under Integration > API Clients.' },
      { step: 2, text: 'Copy the Client ID and generate a Client Secret.' },
      { step: 3, text: 'Enter your Tenant URL and credentials, then click Connect.' },
    ],
  },
  {
    id: 'personio',
    name: 'Personio',
    description: 'Integrate with Personio for employee management, recruiting, and HR workflows.',
    category: 'hr',
    icon: 'personio',
    status: 'connected',
    authType: 'api_key',
    connectedAt: '2025-01-28T10:00:00Z',
    lastSync: '2025-02-02T07:30:00Z',
    features: ['Employees', 'Absence', 'Recruiting', 'Documents'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'API Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'API Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Personio Settings > Integrations > API Credentials.' },
      { step: 2, text: 'Create new credentials and copy the Client ID and Secret.' },
      { step: 3, text: 'Enter the credentials and click Connect.' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Integrate Slack for internal notifications, team communication, and workflow automation.',
    category: 'tools',
    icon: 'slack',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-10T09:00:00Z',
    lastSync: '2025-02-02T10:00:00Z',
    features: ['Messages', 'Channels', 'Notifications', 'File sharing'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...', required: true },
      { key: 'signing_secret', label: 'Signing Secret', type: 'password', placeholder: 'Signing Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to api.slack.com/apps and create a new app.' },
      { step: 2, text: 'Install the app to your workspace and copy the Bot Token.' },
      { step: 3, text: 'Copy the Signing Secret from the Basic Information page.' },
      { step: 4, text: 'Enter the Bot Token and Signing Secret, then click Connect.' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps through Zapier to automate your workflows without code.',
    category: 'tools',
    icon: 'zapier',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Zaps', 'Triggers', 'Actions', 'Multi-step'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Zapier API Key', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Zapier and go to Developer Platform.' },
      { step: 2, text: 'Generate an API key for your integration.' },
      { step: 3, text: 'Enter the API key and click Connect.' },
    ],
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Read and write data to Google Sheets for reporting, data sync, and automation.',
    category: 'tools',
    icon: 'google_sheets',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Read data', 'Write data', 'Create sheets', 'Formulas'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'service_account', label: 'Service Account JSON', type: 'password', placeholder: 'Paste JSON key contents', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Google Cloud Console and create a Service Account.' },
      { step: 2, text: 'Download the JSON key file.' },
      { step: 3, text: 'Share your Google Sheet with the service account email.' },
      { step: 4, text: 'Paste the JSON key contents and click Connect.' },
    ],
  },
  {
    id: 'power_automate',
    name: 'Power Automate',
    description: 'Integrate with Microsoft Power Automate to create automated workflows across services.',
    category: 'tools',
    icon: 'power_automate',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Flows', 'Triggers', 'Connectors', 'Templates'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'tenant_id', label: 'Tenant ID', type: 'text', placeholder: 'Azure AD Tenant ID', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Register an app in Azure AD with Power Automate permissions.' },
      { step: 2, text: 'Copy the Tenant ID, Client ID, and generate a Client Secret.' },
      { step: 3, text: 'Enter credentials and click Connect.' },
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
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
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
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
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
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'PayPal Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'PayPal Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to developer.paypal.com and create an app.' },
      { step: 2, text: 'Copy the Client ID and Secret from the app details.' },
      { step: 3, text: 'Enter credentials and click Connect.' },
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
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Intercom Access Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Intercom Developer Hub and create a new app.' },
      { step: 2, text: 'Generate an Access Token with the required permissions.' },
      { step: 3, text: 'Enter the Access Token and click Connect.' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Voice, SMS, and WhatsApp messaging platform for omnichannel communication.',
    category: 'communication',
    icon: 'twilio',
    status: 'connected',
    authType: 'api_key',
    connectedAt: '2025-01-15T10:00:00Z',
    lastSync: '2025-02-02T08:30:00Z',
    features: ['Voice calls', 'SMS', 'WhatsApp', 'Video'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxx', required: true },
      { key: 'auth_token', label: 'Auth Token', type: 'password', placeholder: 'Auth Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Log in to Twilio Console at console.twilio.com.' },
      { step: 2, text: 'Copy the Account SID and Auth Token from the dashboard.' },
      { step: 3, text: 'Enter both values and click Connect.' },
    ],
    docsUrl: 'https://www.twilio.com/docs',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Official WhatsApp Business API for messaging, templates, and media sharing.',
    category: 'communication',
    icon: 'whatsapp',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-20T14:00:00Z',
    lastSync: '2025-02-02T09:15:00Z',
    features: ['Messaging', 'Templates', 'Media sharing', 'Business profile'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: 'Phone Number ID', required: true },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Permanent Access Token', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Meta for Developers and select your WhatsApp Business app.' },
      { step: 2, text: 'Copy the Phone Number ID and generate a Permanent Access Token.' },
      { step: 3, text: 'Enter both and click Connect.' },
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Google email service for sending and receiving emails through your conversational AI.',
    category: 'communication',
    icon: 'gmail',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Send emails', 'Read emails', 'Labels', 'Attachments'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Google OAuth Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to Google Cloud Console and create OAuth credentials.' },
      { step: 2, text: 'Enable the Gmail API for your project.' },
      { step: 3, text: 'Copy the Client ID and Secret, then click Connect.' },
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Integrate with Shopify to manage products, orders, and customer data in your store.',
    category: 'retail',
    icon: 'shopify',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Products', 'Orders', 'Customers', 'Inventory'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'store_url', label: 'Store URL', type: 'url', placeholder: 'your-store.myshopify.com', required: true },
      { key: 'access_token', label: 'Admin API Access Token', type: 'password', placeholder: 'shpat_...', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to your Shopify Admin > Settings > Apps and sales channels > Develop apps.' },
      { step: 2, text: 'Create a custom app and configure the Admin API scopes.' },
      { step: 3, text: 'Install the app and copy the Admin API Access Token.' },
      { step: 4, text: 'Enter your store URL and Access Token, then click Connect.' },
    ],
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Integrate with WooCommerce for product management and order processing.',
    category: 'retail',
    icon: 'woocommerce',
    status: 'disconnected',
    authType: 'api_key',
    features: ['Products', 'Orders', 'Customers', 'Reports'],
    fields: [
      { key: 'account_name', label: 'Account Name', type: 'text', placeholder: 'Account name', required: true },
      { key: 'store_url', label: 'Store URL', type: 'url', placeholder: 'https://your-store.com', required: true },
      { key: 'consumer_key', label: 'Consumer Key', type: 'text', placeholder: 'ck_...', required: true },
      { key: 'consumer_secret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_...', required: true },
    ],
    instructions: [
      { step: 1, text: 'Go to WooCommerce > Settings > Advanced > REST API.' },
      { step: 2, text: 'Add a key with Read/Write permissions.' },
      { step: 3, text: 'Copy the Consumer Key and Consumer Secret.' },
      { step: 4, text: 'Enter your store URL and credentials, then click Connect.' },
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

export function useIntegrationsData() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);

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
          }
        : int
    ));

    return { success: true };
  }, []);

  const disconnectIntegration = useCallback(async (integrationId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? {
            ...int,
            status: 'disconnected' as IntegrationStatus,
            connectedAt: undefined,
            lastSync: undefined,
          }
        : int
    ));

    return { success: true };
  }, []);

  const createAPIKey = useCallback(async (name: string, permissions: string[]): Promise<{ success: boolean; key?: APIKey }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name,
      key: `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      permissions,
      isActive: true,
    };

    setApiKeys(prev => [newKey, ...prev]);
    return { success: true, key: newKey };
  }, []);

  const revokeAPIKey = useCallback(async (keyId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
    return { success: true };
  }, []);

  const toggleAPIKey = useCallback(async (keyId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setApiKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, isActive: !k.isActive } : k
    ));
    return { success: true };
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

    setWebhooks(prev => [newWebhook, ...prev]);
    return { success: true };
  }, []);

  return {
    integrations,
    apiKeys,
    webhooks,
    connectIntegration,
    disconnectIntegration,
    createAPIKey,
    revokeAPIKey,
    toggleAPIKey,
    createWebhook,
  };
}
