export interface DocSection {
  id: string;
  title: string;
  category: string;
  content: string;
  description?: string;
}

export const DOCS: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    category: "Getting Started",
    description: "Learn how ThriveStack unifies your growth intelligence.",
    content: `
# Welcome to ThriveStack

ThriveStack is the **Growth Intelligence Platform** designed for high-velocity B2B SaaS teams. We unify GTM, Product, Revenue, and Customer Success data into a single source of truth.

## Why ThriveStack?

In most SaaS companies, data is siloed:
- **Marketing** sees clicks but not product activation.
- **Product** sees usage but not revenue impact.
- **Sales** sees accounts but not real-time growth signals.

ThriveStack breaks these siloes by correlating every customer signal with revenue outcomes.

## Core Concepts

### 1. Unified Growth Intelligence
We connect your entire stack—from your website and product to your CRM and billing system—to provide a 360-degree view of the customer journey.

### 2. Growth Signals
Identify high-intent actions that predict conversion, expansion, or churn.

### 3. Revenue Orchestration
Turn insights into action by pushing signals back to your GTM tools (Salesforce, HubSpot, Slack) to drive predictable revenue.

---

## Quick Start Path
1. **[Connect Your Data](/docs/event-tracking)**: Install our SDK or connect your cloud sources.
2. **[Define Your Journey](/docs/product-intelligence)**: Map out your key activation and retention milestones.
3. **[Analyze Signals](/docs/reports)**: Use our board-ready reports to identify growth leaks.
4. **[Orchestrate Revenue](/docs/crm-syncs)**: Automate your sales and marketing plays based on real-time signals.
    `,
  },
  {
    id: "event-tracking",
    title: "Event Tracking SDK",
    category: "Implementation",
    description: "Technical guide for implementing ThriveStack tracking.",
    content: `
# Event Tracking SDK

Our SDKs are designed to be lightweight, privacy-first, and easy to implement.

## Installation

### JavaScript / TypeScript
\`\`\`bash
npm install @thrivestack/analytics-js
\`\`\`

### Initialization
Initialize the SDK with your API Key found in the ThriveStack Dashboard.

\`\`\`javascript
import { ThriveStack } from '@thrivestack/analytics-js';

const thrivestack = new ThriveStack({
  apiKey: 'YOUR_API_KEY',
  debug: true
});
\`\`\`

## Tracking Events

Use the \`track\` method to capture user actions.

\`\`\`javascript
thrivestack.track('Feature Used', {
  feature_name: 'Revenue Forecast',
  plan: 'Enterprise'
});
\`\`\`

## Identifying Users

To correlate product usage with CRM data, you must identify your users.

\`\`\`javascript
thrivestack.identify('user_123', {
  email: 'jane@example.com',
  name: 'Jane Doe',
  company: 'Acme Corp'
});
\`\`\`

## Best Practices
- **Consistent Naming**: Use Object-Action notation (e.g., \`Report Exported\`).
- **Property Richness**: Include relevant context like \`source\`, \`category\`, or \`value\`.
- **Server-side for Sensitive Data**: Use our Node.js SDK for billing or backend events.
    `,
  },
  {
    id: "journey-to-event",
    title: "Journey to Event",
    category: "Implementation",
    description: "Mapping of journey phases to objects, activities, and telemetry events.",
    content: `
# Customer Journey Events

Mapping of journey phases → objects → activities → telemetry events.

**Call types:**
- \`track\` → \`POST /api/track\` (requires \`event_name\`)
- \`identify\` → \`POST /api/identify\` (user traits, on every login/session)
- \`group\` → \`POST /api/group\` (account traits, on every login/session)
- \`page_visit\` → \`POST /api/track\` with \`event_name: "page_visit"\`

---

## Acquisition
> Visitor discovers and signs up for your product.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Marketing page visited | \`page_visit\` | \`page_visit\` | page_url, page_path, utm_source, utm_medium, utm_campaign, utm_term |
| User signed up | \`track\` | \`signed_up\` | user_email, user_name, utm_source, utm_medium, utm_campaign |
| User identified after signup | \`identify\` | — | user_email, user_name |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Account created | \`track\` | \`account_created\` | account_name, account_domain, account_id |
| Account identified | \`group\` | — | group_type, account_name, account_domain |

---

## Activation
> User/account reaches the "aha moment" by completing key onboarding steps.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| User logged in | \`identify\` | — | user_email, user_name |
| Profile completed | \`track\` | \`profile_completed\` | user_name, user_email, company_name, user_role |
| Onboarding step completed | \`track\` | \`onboarding_step_completed\` | step_name, completion_status, user_role |
| First project created | \`track\` | \`first_project_created\` | project_name, user_role |
| Settings configured | \`track\` | \`settings_configured\` | setting_name, user_role |
| Payment added | \`track\` | \`payment_added\` | plan_name, user_role |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Account session identified | \`group\` | — | group_type, account_name, account_domain |
| User added to account | \`track\` | \`account_added_user\` | account_name, user_email |

---

## Engagement
> Users actively use core features of the product.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Feature used | \`track\` | \`feature_used\` | feature_name, feature_type, user_role |
| Product page visited | \`page_visit\` | \`page_visit\` | page_url, page_path, page_title |
| Session identified | \`identify\` | — | user_email, user_name |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Account-level feature used | \`track\` | \`feature_used\` | feature_name, feature_type |
| Account session identified | \`group\` | — | account_name, account_domain |

---

## Retention
> Users and accounts continue using the product over time.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| User returned / active session | \`identify\` | — | user_email, user_name |
| Returning user page visited | \`page_visit\` | \`page_visit\` | page_url, page_path |
| Feature used (repeat) | \`track\` | \`feature_used\` | feature_name, feature_type, user_role |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Account active session | \`group\` | — | account_name, account_domain |
| Account-level feature used (repeat) | \`track\` | \`feature_used\` | feature_name, feature_type |

---

## Expansion
> Account grows — more users added, team invited, or plan upgraded.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Invite sent | \`track\` | \`invite_sent\` | invitee_email, invitee_role, invitee_team, feature_name, source_url |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| New user added to account | \`track\` | \`account_added_user\` | account_name, user_email |
| Invite sent from account | \`track\` | \`invite_sent\` | invitee_email, invitee_role, invitee_team |
| Account traits updated (plan upgrade) | \`group\` | — | account_name, plan_name, account_domain |

---

## Contraction
> Account downgrades, reduces seats, or reduces usage.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| User removed from account | \`track\` | \`account_removed_user\` | account_name, user_email, user_role |
| Feature usage dropped (absence signal) | \`track\` | \`feature_used\` | feature_name, feature_type, user_role |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Plan downgraded | \`track\` | \`plan_downgraded\` | previous_plan, new_plan, account_name |
| Account traits updated (plan downgrade) | \`group\` | — | account_name, plan_name, account_domain |

---

## Churn
> User or account cancels / stops using the product.

### Users

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| User deleted / deactivated | \`track\` | \`user_deleted\` | user_email, user_role, account_name |

### Accounts

| Activity | Call Type | Event Name | Key Properties |
|---|---|---|---|
| Subscription cancelled | \`track\` | \`subscription_cancelled\` | account_name, plan_name, cancellation_reason |
| Account deleted | \`track\` | \`account_deleted\` | account_name, account_domain, account_id |

---

## Event → Phase Reverse Lookup

| Event Name | Phases |
|---|---|
| \`page_visit\` | Acquisition, Engagement, Retention |
| \`signed_up\` | Acquisition |
| \`identify\` | Acquisition, Activation, Engagement, Retention |
| \`account_created\` | Acquisition |
| \`group\` | Acquisition, Activation, Engagement, Retention, Expansion, Contraction |
| \`profile_completed\` | Activation |
| \`onboarding_step_completed\` | Activation |
| \`first_project_created\` | Activation |
| \`settings_configured\` | Activation |
| \`payment_added\` | Activation |
| \`account_added_user\` | Activation, Expansion |
| \`feature_used\` | Engagement, Retention, Contraction |
| \`invite_sent\` | Expansion |
| \`account_removed_user\` | Contraction |
| \`plan_downgraded\` | Contraction |
| \`user_deleted\` | Churn |
| \`subscription_cancelled\` | Churn |
| \`account_deleted\` | Churn |
    `,
  },
  {
    id: "product-intelligence",
    title: "Product Intelligence",
    category: "Analytics",
    description: "Analyze product usage, customer journey milestones, and retention signals.",
    content: `
# Product Intelligence

Understand how your product drives growth. ThriveStack helps you identify the "Aha!" moments that lead to long-term customer value.

## Journey Milestones

### 1. Sign-up & Onboarding
Track the velocity from account creation to first value.
- **Key Metric**: Time to First Value (TTFV).

### 2. Activation (The "Aha!" Moment)
The specific action that correlates most strongly with retention.
- *Example*: In ThriveStack, activation is "First CRM Sync Completed".

### 3. Retention & Habit Formation
Monitor daily, weekly, and monthly active usage patterns.
- **Cohort Analysis**: Compare retention across different sign-up months or marketing channels.

## Advanced Analytics
- **Path Analysis**: See the most common routes users take to activation.
- **Funnel Drop-off**: Identify exactly where users are getting stuck in your onboarding.
- **Feature Impact**: Correlate specific feature usage with account expansion.

## Growth & Retention Signals

### NRR & Expansion Signals
Identify accounts that are ready for an upsell based on product usage.
- **Signals**: Seat limit reached, high usage of premium features, or frequent exports.

### Churn Prediction
Get alerted when high-value accounts show declining usage patterns. ThriveStack monitors engagement drops to predict potential churn before it happens.
    `,
  },
  {
    id: "marketing-intelligence",
    title: "Marketing Intelligence",
    category: "Analytics",
    description: "Analyze marketing channel ROI and conversion acceleration.",
    content: `
# Marketing Intelligence

Go beyond clicks and MQLs. ThriveStack connects your marketing efforts directly to product activation and revenue.

## 1. Free-to-Paid Acceleration
Analyze the conversion funnel from trial to paid.
- **Insights**: Which marketing channels produce the fastest conversions?
- **Velocity**: Measure the time it takes for users from different sources to reach paid status.

## 2. Marketing Channel ROI
See which channels drive actual product activation and revenue, not just sign-ups.
- **Attribution**: Full-journey attribution from first touch to expansion.
- **Cost Analysis**: Correlate ad spend with the Lifetime Value (LTV) of acquired users.
    `,
  },
  {
    id: "revenue-intelligence",
    title: "Revenue Intelligence",
    category: "Analytics",
    description: "Unify billing and usage data to predict and drive revenue.",
    content: `
# Revenue Intelligence

Unify your billing and usage data to predict and drive revenue. ThriveStack connects the dots between how customers use your product and how they pay for it.

## Key Metrics
- **ARR (Annual Recurring Revenue)**: Real-time tracking of your recurring revenue across all accounts.
- **NRR (Net Revenue Retention)**: Understand how your existing customer base is growing or shrinking.
- **LTV (Lifetime Value)**: Predict the long-term value of your customer segments.

## Revenue Signals
Identify accounts that are ready for an upgrade or at risk of churn based on their payment history and product engagement.
- **Expansion Signals**: High usage combined with a lower-tier plan.
- **Churn Risk**: Expired credit cards or failed payments for high-usage accounts.
    `,
  },
  {
    id: "crm-syncs",
    title: "CRM & GTM Syncs",
    category: "Integrations",
    description: "Sync growth signals to Salesforce, HubSpot, and Slack.",
    content: `
# CRM & GTM Syncs

ThriveStack isn't just for analysis—it's for action. Push your growth signals directly into the tools your team uses every day.

## Salesforce & HubSpot
- **Bidirectional Sync**: Keep your CRM updated with real-time product usage data.
- **Lead Scoring**: Automatically update lead scores based on product activation milestones.
- **Task Automation**: Create tasks for AEs when a trial user reaches the "Aha!" moment.

## Slack Alerts
- **Real-time Notifications**: Get alerted when a "Whale" account signs up or a key customer hits a usage limit.
- **Channel Routing**: Route alerts to specific sales or success channels based on account ownership.

## Webhooks
- **Custom Orchestration**: Trigger custom workflows in Zapier, Make, or your own internal systems.
    `,
  },
  {
    id: "stripe",
    title: "Stripe",
    category: "Integrations",
    description: "Connect Stripe to sync subscription and transaction data.",
    content: `
# Stripe Integration

Connect Stripe to ThriveStack to sync your subscription and transaction data.

## How to Connect
1. **API Key**: Obtain your Restricted API Key from the Stripe Dashboard.
2. **Permissions**: Ensure the key has read access to \`Subscriptions\`, \`Customers\`, and \`Invoices\`.
3. **ThriveStack Setup**: Navigate to Settings > Integrations > Stripe and paste your API Key.

## Data Synced
- Customer subscription status (Active, Past Due, Canceled).
- Plan details and billing cycles.
- Historical revenue data for LTV calculations.
    `,
  },
  {
    id: "chargebee",
    title: "Chargebee",
    category: "Integrations",
    description: "Sync Chargebee billing data for revenue health insights.",
    content: `
# Chargebee Integration

Sync your Chargebee billing data with ThriveStack to get a complete view of your revenue health.

## How to Connect
1. **Site Name**: Provide your Chargebee site name (e.g., \`acme-main\`).
2. **API Key**: Generate a Full Access API Key in Chargebee Settings.
3. **ThriveStack Setup**: Enter your Site Name and API Key in the Chargebee integration panel.

## Key Benefits
- Correlate Chargebee plan changes with product feature usage.
- Track trial-to-paid conversion velocity.
- Automated revenue reporting without manual exports.
    `,
  },
  {
    id: "hubspot",
    title: "HubSpot",
    category: "Integrations",
    description: "Push growth signals and product usage data to HubSpot.",
    content: `
# HubSpot Integration

Push growth signals and product usage data directly into HubSpot to empower your sales and success teams.

## How to Connect
1. **OAuth Flow**: Click "Connect HubSpot" in the ThriveStack dashboard.
2. **Authorization**: Grant ThriveStack permission to access your HubSpot CRM.
3. **Mapping**: Map ThriveStack account properties to HubSpot Company properties.

## Use Cases
- **Automated Workflows**: Trigger HubSpot workflows when a user reaches an activation milestone.
- **Lead Scoring**: Update HubSpot lead scores based on real-time product engagement.
- **Account Health**: View product usage charts directly within HubSpot Company records.
    `,
  },
  {
    id: "vibe-analytics",
    title: "Vibe Analytics (AI)",
    category: "Advanced",
    description: "Self-contained technical specification for AI-driven telemetry instrumentation.",
    content: `
# SYSTEM INSTRUCTION: ThriveStack Telemetry Implementation Spec
**Version:** 2.1  
**Target Audience:** AI Coding Assistants (Claude, Gemini, Cursor, etc.)

---

## 1. CORE MISSION
You are tasked with instrumenting a web application with ThriveStack Product Telemetry. This telemetry powers "Vibe Analytics" — an AI-driven growth engine. You must follow the schemas, naming conventions, and structural rules below with 100% precision.

---

## 2. PREREQUISITES (STATE DISCOVERY)
Before writing code, you **MUST** locate the following variables in the existing codebase:

1.  **userId**: The authenticated user's unique UUID (e.g., \`user.id\`, \`session.userId\`).
2.  **groupId**: The organization/account/workspace unique UUID (e.g., \`org.id\`, \`workspaceId\`).

> **CRITICAL:** If you cannot find a \`groupId\`, you must ask the user for the variable name representing the Account/Organization ID. Do not proceed with fake data.

---

## 3. INITIALIZATION (ROOT LAYOUT)
Add the following script to the \`<head>\` of the root layout file (e.g., \`layout.tsx\`, \`_app.tsx\`, \`index.html\`).

\`\`\`html
<script
  src="https://ts-script.app.thrivestack.ai/latest/thrivestack.js"
  api-key="process.env.THRIVESTACK_API_KEY"
  source="product">
</script>
\`\`\`

**RULES:**
- Global object: \`thriveStack\` (lowercase 's').
- \`api-key\` MUST come from an environment variable.
- \`source\` is always "product".

---

## 4. MANDATORY EVENT SCHEMAS
Every call must be wrapped in an **ARRAY**: \`method([{...}])\`.

### A. identify()
**When:** Immediately after login or signup.
\`\`\`javascript
thriveStack.identify([{
  "user_id": userId,
  "traits": {
    "user_email": user.email,
    "user_name": user.name
  },
  "timestamp": new Date().toISOString()
}]);
\`\`\`

### B. group()
**When:** Immediately after \`identify()\`. Establishes the Account context.
\`\`\`javascript
thriveStack.group([{
  "user_id": userId,
  "group_id": groupId,
  "traits": {
    "group_type": "Account",
    "account_domain": org.domain,
    "account_name": org.name,
    "plan_id": org.planId,
    "plan_name": org.planName
  },
  "context": {
    "group_id": groupId,
    "group_type": "Account"
  },
  "timestamp": new Date().toISOString()
}]);
\`\`\`

### C. track() - The Big 7
Every \`track()\` call **REQUIRES** the \`context\` block containing \`group_id\`.

| Event Name | When to Fire |
| :--- | :--- |
| \`signed_up\` | New user registration success. |
| \`account_created\` | New organization/workspace creation success. |
| \`onboarding_step_completed\` | Completion of a setup wizard step. |
| \`invite_sent\` | Invitation sent to a teammate. |
| \`user_added_to_account\` | User joins an account via invite/SSO. |
| \`account_added_user\` | Admin adds a user to an account. |
| \`feature_used\` | Core product action (e.g., \`report_generated\`). |

**Example: \`account_added_user\`**
\`\`\`javascript
thriveStack.track([{
  "event_name": "account_added_user",
  "user_id": adminId,
  "properties": {
    "user_email": adminEmail,
    "added_user_id": newUserId,
    "role": "member"
  },
  "context": {
    "group_id": groupId,
    "group_type": "Account"
  },
  "timestamp": new Date().toISOString()
}]);
\`\`\`

---

## 5. IMPLEMENTATION CHECKLIST FOR AI
1.  [ ] **Verify Global**: Check \`typeof thriveStack !== 'undefined'\` before calling.
2.  [ ] **Array Wrapper**: Ensure every call is \`method([{...}])\`.
3.  [ ] **Context Block**: Ensure \`context: { group_id, group_type: "Account" }\` is on every \`track()\` call.
4.  [ ] **Snake Case**: Use \`snake_case\` for event names and property keys.
5.  [ ] **No Blocking**: Fire-and-forget. Do not \`await\` telemetry calls.

---

## 6. TROUBLESHOOTING / HARD RULES
- **NEVER** use \`group_type: "Organization"\`. It must be \`"Account"\`.
- **NEVER** generate random UUIDs for \`group_id\`. Use the app's existing state.
- **ALWAYS** call \`identify()\` before \`group()\`.
- **ALWAYS** call \`group()\` before \`track()\` in a session flow.
    `,
  },
];
