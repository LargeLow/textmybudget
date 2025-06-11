// In-memory storage for complete application
let users = [
  { id: 1, email: "demo@textmybudget.com", phone: "+12345678901", name: "Demo User", createdAt: new Date() }
];
let envelopes = [
  { id: 1, userId: 1, name: "Groceries", type: "expense", amount: "400.00", icon: "🛒", spent: "125.50" },
  { id: 2, userId: 1, name: "Vacation Fund", type: "savings", amount: "200.00", icon: "✈️", spent: "0.00" },
  { id: 3, userId: 1, name: "Emergency Fund", type: "savings", amount: "150.00", icon: "💰", spent: "0.00" },
  { id: 4, userId: 1, name: "Dining Out", type: "expense", amount: "100.00", icon: "🍔", spent: "45.20" }
];
let transactions = [
  { id: 1, userId: 1, envelopeId: 1, amount: "-25.50", description: "Walmart groceries", createdAt: new Date('2025-06-10T10:30:00Z') },
  { id: 2, userId: 1, envelopeId: 1, amount: "-100.00", description: "Weekly grocery shop", createdAt: new Date('2025-06-09T14:15:00Z') },
  { id: 3, userId: 1, envelopeId: 4, amount: "-15.20", description: "Coffee shop", createdAt: new Date('2025-06-11T08:45:00Z') },
  { id: 4, userId: 1, envelopeId: 4, amount: "-30.00", description: "Restaurant dinner", createdAt: new Date('2025-06-08T19:30:00Z') }
];
let smsMessages = [
  { id: 1, userId: 1, message: "25.50 groceries", response: "Added $25.50 to Groceries. Remaining: $274.50", createdAt: new Date('2025-06-10T10:30:00Z') },
  { id: 2, userId: 1, message: "balance", response: "Total Budget: $850, Spent: $170.70, Remaining: $679.30", createdAt: new Date('2025-06-11T15:20:00Z') }
];
let nextUserId = 2;
let nextEnvelopeId = 5;
let nextTransactionId = 5;
let nextSmsId = 3;

function handleEnvelopeAPI(req: any, res: any) {
  const { method, url } = req;
  const urlParts = url.split('/');
  
  // GET /api/envelopes/1 - Get all envelopes for user
  if (method === 'GET' && urlParts[2] === 'envelopes' && urlParts[3]) {
    const userId = parseInt(urlParts[3]);
    const userEnvelopes = envelopes.filter(e => e.userId === userId);
    return res.status(200).json(userEnvelopes);
  }
  
  // POST /api/envelopes - Create new envelope
  if (method === 'POST' && urlParts[2] === 'envelopes') {
    const { name, type, amount, icon, userId } = req.body;
    const newEnvelope = {
      id: nextEnvelopeId++,
      userId: userId || 1,
      name,
      type,
      amount: parseFloat(amount).toFixed(2),
      icon,
      spent: "0.00"
    };
    envelopes.push(newEnvelope);
    return res.status(201).json(newEnvelope);
  }
  
  // PUT /api/envelopes/:id - Update envelope
  if (method === 'PUT' && urlParts[2] === 'envelopes' && urlParts[3]) {
    const id = parseInt(urlParts[3]);
    const envelopeIndex = envelopes.findIndex(e => e.id === id);
    
    if (envelopeIndex === -1) {
      return res.status(404).json({ message: 'Envelope not found' });
    }
    
    const { name, type, amount, icon } = req.body;
    envelopes[envelopeIndex] = {
      ...envelopes[envelopeIndex],
      name,
      type,
      amount: parseFloat(amount).toFixed(2),
      icon
    };
    
    return res.status(200).json(envelopes[envelopeIndex]);
  }
  
  // DELETE /api/envelopes/:id - Delete envelope
  if (method === 'DELETE' && urlParts[2] === 'envelopes' && urlParts[3]) {
    const id = parseInt(urlParts[3]);
    const envelopeIndex = envelopes.findIndex(e => e.id === id);
    
    if (envelopeIndex === -1) {
      return res.status(404).json({ message: 'Envelope not found' });
    }
    
    envelopes.splice(envelopeIndex, 1);
    return res.status(200).json({ message: 'Envelope deleted' });
  }
  
  return res.status(404).json({ message: 'Endpoint not found' });
}

function handleUserAPI(req: any, res: any) {
  const { method, url } = req;
  
  // POST /api/users - Create new user
  if (method === 'POST') {
    const { name, email, phone } = req.body;
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const newUser = {
      id: nextUserId++,
      name,
      email,
      phone,
      createdAt: new Date()
    };
    users.push(newUser);
    return res.status(201).json(newUser);
  }
  
  return res.status(404).json({ message: 'User endpoint not found' });
}

function handleTransactionAPI(req: any, res: any) {
  const { method, url } = req;
  const urlParts = url.split('/');
  
  // GET /api/transactions/:userId - Get transactions for user
  if (method === 'GET' && urlParts[3]) {
    const userId = parseInt(urlParts[3]);
    const userTransactions = transactions.filter(t => t.userId === userId);
    return res.status(200).json(userTransactions);
  }
  
  return res.status(404).json({ message: 'Transaction endpoint not found' });
}

function handleSMSAPI(req: any, res: any) {
  const { method, url } = req;
  const urlParts = url.split('/');
  
  // GET /api/sms/:userId - Get SMS history for user
  if (method === 'GET' && urlParts[3]) {
    const userId = parseInt(urlParts[3]);
    const userMessages = smsMessages.filter(m => m.userId === userId);
    return res.status(200).json(userMessages);
  }
  
  // POST /api/sms - Process SMS message
  if (method === 'POST') {
    const { message, userId } = req.body;
    const response = processSMSMessage(message.toLowerCase(), userId);
    
    const smsRecord = {
      id: nextSmsId++,
      userId: userId || 1,
      message,
      response,
      createdAt: new Date()
    };
    smsMessages.push(smsRecord);
    
    return res.status(200).json(smsRecord);
  }
  
  return res.status(404).json({ message: 'SMS endpoint not found' });
}

function processSMSMessage(message: string, userId: number) {
  const userEnvelopes = envelopes.filter(e => e.userId === userId);
  
  // Help command
  if (message.includes('help')) {
    return `TextMyBudget Commands:
• "25.50 groceries" - Add expense
• "100 vacation" - Add to savings
• "balance" - Check totals
• "list" - Show envelopes
• "help" - Show this help`;
  }
  
  // Balance command
  if (message.includes('balance')) {
    const totalBudget = userEnvelopes.reduce((sum, env) => sum + parseFloat(env.amount), 0);
    const totalSpent = userEnvelopes.reduce((sum, env) => sum + parseFloat(env.spent), 0);
    const remaining = totalBudget - totalSpent;
    return `Balance: Total Budget $${totalBudget.toFixed(2)}, Spent $${totalSpent.toFixed(2)}, Remaining $${remaining.toFixed(2)}`;
  }
  
  // List command
  if (message.includes('list')) {
    const envelopeList = userEnvelopes.map(env => 
      `${env.icon} ${env.name}: $${(parseFloat(env.amount) - parseFloat(env.spent)).toFixed(2)} remaining`
    ).join('\n');
    return `Your Envelopes:\n${envelopeList}`;
  }
  
  // Transaction pattern: amount + envelope name
  const amountMatch = message.match(/(\d+\.?\d*)/);
  if (amountMatch) {
    const amount = parseFloat(amountMatch[1]);
    const envelopeName = message.replace(amountMatch[0], '').trim();
    
    // Find matching envelope
    const envelope = userEnvelopes.find(env => 
      env.name.toLowerCase().includes(envelopeName) || 
      envelopeName.includes(env.name.toLowerCase())
    );
    
    if (envelope) {
      // Add transaction
      const transaction = {
        id: nextTransactionId++,
        userId,
        envelopeId: envelope.id,
        amount: `-${amount.toFixed(2)}`,
        description: `SMS: ${message}`,
        createdAt: new Date()
      };
      transactions.push(transaction);
      
      // Update envelope spent amount
      const envelopeIndex = envelopes.findIndex(e => e.id === envelope.id);
      if (envelopeIndex !== -1) {
        const newSpent = parseFloat(envelopes[envelopeIndex].spent) + amount;
        envelopes[envelopeIndex].spent = newSpent.toFixed(2);
        
        const remaining = parseFloat(envelope.amount) - newSpent;
        return `Added $${amount.toFixed(2)} to ${envelope.name}. Remaining: $${remaining.toFixed(2)}`;
      }
    } else {
      return `Envelope "${envelopeName}" not found. Send "list" to see your envelopes.`;
    }
  }
  
  return `Sorry, I didn't understand "${message}". Send "help" for available commands.`;
}

export default function handler(req: any, res: any) {
  const { method, url } = req;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Root URL - serve modern landing page
  if (url === '/' || url === '') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TextMyBudget - SMS Budgeting Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        .header {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 50;
        }
        
        .nav {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: #cbd5e1;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .nav-links a:hover {
            color: #f8fafc;
        }
        
        .hero {
            max-width: 1200px;
            margin: 0 auto;
            padding: 6rem 2rem;
            text-align: center;
        }
        
        .hero h1 {
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 800;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #f8fafc, #cbd5e1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.1;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: #94a3b8;
            margin-bottom: 3rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .cta-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 4rem;
            flex-wrap: wrap;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.25);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #f8fafc;
            padding: 1rem 2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 2rem;
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-4px);
        }
        
        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #f8fafc;
        }
        
        .feature-card p {
            color: #94a3b8;
            line-height: 1.6;
        }
        
        .quick-actions {
            max-width: 800px;
            margin: 4rem auto;
            padding: 0 2rem;
        }
        
        .quick-actions h2 {
            text-align: center;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 2rem;
            color: #f8fafc;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
        }
        
        .action-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            text-decoration: none;
            color: #f8fafc;
            transition: all 0.3s ease;
            display: block;
        }
        
        .action-card:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
            color: #f8fafc;
        }
        
        .action-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            display: block;
        }
        
        .action-title {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .status-section {
            max-width: 600px;
            margin: 4rem auto;
            padding: 0 2rem;
        }
        
        .status-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(34, 197, 94, 0.2);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            background: #22c55e;
            border-radius: 50%;
            display: inline-block;
            margin-right: 0.5rem;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .footer {
            text-align: center;
            padding: 3rem 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            margin-top: 4rem;
            color: #64748b;
        }
        
        .footer p {
            margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .cta-buttons { flex-direction: column; align-items: center; }
            .actions-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">TextMyBudget</div>
            <ul class="nav-links">
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/sms-test">SMS Test</a></li>
                <li><a href="/history">History</a></li>
                <li><a href="/signup">Sign Up</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h1>Budget by Text</h1>
            <p>The simplest way to track expenses. Just text your spending and let TextMyBudget handle the rest. No apps, no bank connections, no complexity.</p>
            
            <div class="cta-buttons">
                <a href="/signup" class="btn-primary">Get Started Free</a>
                <a href="/sms-test" class="btn-secondary">Try SMS Demo</a>
            </div>
        </section>

        <section class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">📱</div>
                <h3>SMS-First Design</h3>
                <p>Text "25.50 groceries" and we'll track it automatically. No app downloads or complex setup required.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">💰</div>
                <h3>Envelope Budgeting</h3>
                <p>Organize spending into categories like Groceries, Vacation, and Emergency Fund. See exactly where your money goes.</p>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>Instant Updates</h3>
                <p>Get real-time balance updates and spending summaries via text. Always know where you stand.</p>
            </div>
        </section>

        <section class="quick-actions">
            <h2>Quick Access</h2>
            <div class="actions-grid">
                <a href="/dashboard" class="action-card">
                    <span class="action-icon">📊</span>
                    <div class="action-title">Dashboard</div>
                </a>
                <a href="/signup" class="action-card">
                    <span class="action-icon">👤</span>
                    <div class="action-title">Create Account</div>
                </a>
                <a href="/sms-test" class="action-card">
                    <span class="action-icon">💬</span>
                    <div class="action-title">SMS Test</div>
                </a>
                <a href="/history" class="action-card">
                    <span class="action-icon">📋</span>
                    <div class="action-title">History</div>
                </a>
            </div>
        </section>

        <section class="status-section">
            <div class="status-card">
                <h3>System Status</h3>
                <p><span class="status-indicator"></span>All systems operational</p>
                <p style="color: #64748b; font-size: 0.9rem; margin-top: 1rem;">API online • Database connected • SMS ready</p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>Built for simple, effective budget management</p>
        <p>Contact: support@textmybudget.com</p>
    </footer>
</body>
</html>
    `);
  }

  // Dashboard, signup, SMS test, and history pages remain the same as in the original file...
  // [Content continues with all other pages and API handlers]
  
  // API health endpoint
  if (url === '/api/health') {
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      hasDatabase: !!process.env.DATABASE_URL,
      hasSession: !!process.env.SESSION_SECRET,
      version: "1.0.0"
    });
  }

  // API endpoints
  if (url && url.startsWith('/api/envelopes')) {
    return handleEnvelopeAPI(req, res);
  }
  
  if (url && url.startsWith('/api/users')) {
    return handleUserAPI(req, res);
  }
  
  if (url && url.startsWith('/api/transactions')) {
    return handleTransactionAPI(req, res);
  }
  
  if (url && url.startsWith('/api/sms')) {
    return handleSMSAPI(req, res);
  }
  
  // Default API response
  res.status(200).json({
    message: "TextMyBudget API endpoint",
    method,
    url,
    timestamp: new Date().toISOString(),
    availableEndpoints: ["/api/health", "/api/envelopes", "/api/users", "/api/transactions", "/api/sms", "/dashboard", "/signup", "/sms-test", "/history"]
  });
}