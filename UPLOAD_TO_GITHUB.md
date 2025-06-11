# Files to Upload to GitHub for Vercel Deployment

Upload these exact files to fix the 500 error:

## Required Files:
- `api/index.ts` (new serverless handler)
- `api/health.ts` (health check endpoint) 
- `server/index.ts` (updated)
- `server/routes.ts` (updated with health endpoint)
- `server/db.ts` (updated for production)
- `vercel.json` (updated configuration)

## Vercel Environment Variables:
Set these in Vercel project settings:
- `DATABASE_URL` = your Neon connection string
- `SESSION_SECRET` = abc123randomstring456 
- `NODE_ENV` = production

## Test After Deployment:
Visit: `https://your-app.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "hasDatabase": true,
  "hasSession": true
}
```

## Database Setup:
In Neon SQL Editor, run:
```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS envelopes CASCADE; 
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phone_number VARCHAR(20), sms_number VARCHAR(20));
CREATE TABLE envelopes (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), name VARCHAR(100) NOT NULL, type VARCHAR(20) NOT NULL, budget_amount DECIMAL(10,2) NOT NULL, current_amount DECIMAL(10,2) NOT NULL DEFAULT 0, period VARCHAR(20) NOT NULL DEFAULT 'monthly', icon VARCHAR(50) NOT NULL DEFAULT 'wallet', is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE transactions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), envelope_id INTEGER NOT NULL REFERENCES envelopes(id), amount DECIMAL(10,2) NOT NULL, description TEXT, source VARCHAR(20) NOT NULL DEFAULT 'sms', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);

INSERT INTO users (username, password, phone_number) VALUES ('demo', 'demo123', '+12345678901');
INSERT INTO envelopes (name, type, user_id, budget_amount, current_amount, icon) VALUES ('Groceries', 'expense', 1, 400.00, 125.50, '🛒'), ('Gas', 'expense', 1, 150.00, 89.25, '⛽'), ('Vacation', 'savings', 1, 200.00, 150.00, '✈️'), ('Emergency Fund', 'savings', 1, 100.00, 75.30, '🚨');
```