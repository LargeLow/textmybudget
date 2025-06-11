# TextMyBudget

A simple SMS-based budgeting platform that allows users to text dollar amounts to track expenses and savings against budget "envelopes" without connecting bank accounts.

## Features

- **SMS Integration**: Text transactions directly to your budget
- **Envelope Budgeting**: Organize spending into categories like Groceries, Gas, Vacation
- **Real-time Tracking**: Instant balance updates and transaction history
- **Web Dashboard**: Full management interface for envelopes and transactions
- **Session-based SMS**: Smart error recovery for incomplete SMS commands

## SMS Commands

- `+25 groceries` - Add $25 expense to Groceries envelope
- `-50 vacation` - Subtract $50 from Vacation savings
- `list` - View all envelopes with balances
- `balance groceries` - Check specific envelope balance
- `transactions` - View recent transaction history
- `help` - Get command help

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your database (PostgreSQL)
4. Configure environment variables (see .env.example)
5. Run migrations: `npm run db:push`
6. Start development server: `npm run dev`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=random-session-secret
TWILIO_ACCOUNT_SID=your-twilio-sid (optional)
TWILIO_AUTH_TOKEN=your-twilio-token (optional)
TWILIO_PHONE_NUMBER=your-twilio-number (optional)
```

## Deployment

This project is configured for Vercel deployment with the included `vercel.json` configuration.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Express.js + Node.js
- Database: PostgreSQL with Drizzle ORM
- Styling: Tailwind CSS + shadcn/ui
- SMS: Twilio webhooks