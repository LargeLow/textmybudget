# Vercel Deployment Steps

## 1. Update GitHub Repository

Upload these updated files to your GitHub repository:
- `server/index.ts` (updated for serverless)
- `server/db.ts` (updated for production)
- `api/index.js` (Vercel entry point)
- `vercel.json` (deployment config)
- `.gitignore` (exclude build files)

## 2. Set Environment Variables in Vercel

Go to your Vercel project > Settings > Environment Variables and add:

```
NODE_ENV = production
SESSION_SECRET = your_random_secret_here_abc123xyz
DATABASE_URL = postgresql://user:pass@host:port/dbname
```

## 3. Get Free PostgreSQL Database

### Option A: Neon (Recommended)
1. Go to neon.tech and sign up
2. Create project: "textmybudget"
3. Copy connection string from dashboard
4. Add to Vercel as DATABASE_URL

### Option B: Supabase
1. Go to supabase.com and sign up
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Add to Vercel as DATABASE_URL

## 4. Create Database Tables

Once you have the database URL, run this SQL in your database console:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  sms_number VARCHAR(20)
);

CREATE TABLE envelopes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  budget_amount DECIMAL(10,2) DEFAULT 0,
  current_amount DECIMAL(10,2) DEFAULT 0,
  period VARCHAR(20) DEFAULT 'monthly',
  icon VARCHAR(10) DEFAULT '💰',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  envelope_id INTEGER REFERENCES envelopes(id),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (username, password, phone_number) 
VALUES ('demo', 'demo123', '+12345678901');

-- Insert demo envelopes
INSERT INTO envelopes (name, type, user_id, budget_amount, current_amount, icon) VALUES
('Groceries', 'expense', 1, 400.00, 125.50, '🛒'),
('Gas', 'expense', 1, 150.00, 89.25, '⛽'),
('Vacation', 'savings', 1, 200.00, 150.00, '✈️'),
('Emergency Fund', 'savings', 1, 100.00, 75.30, '🚨');
```

## 5. Redeploy

After setting environment variables, go to Vercel > Deployments and click "Redeploy" on the latest deployment.

## Troubleshooting

- Check Vercel Function logs for detailed error messages
- Ensure DATABASE_URL is properly formatted
- Test database connection in your database console first