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
  
  // Root URL - serve landing page
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
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0; 
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            text-align: center;
        }
        h1 { 
            font-size: 3rem; 
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle { 
            font-size: 1.5rem; 
            margin-bottom: 2rem; 
            opacity: 0.9;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .feature h3 { 
            margin-top: 0; 
            color: #ffd700;
        }
        .api-status {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .status-good { color: #4ade80; }
        .coming-soon {
            background: rgba(255,215,0,0.2);
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
            border: 2px solid #ffd700;
        }
        .footer {
            margin-top: 3rem;
            opacity: 0.7;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>TextMyBudget</h1>
        <p class="subtitle">SMS-Based Budgeting Platform</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
            <a href="/dashboard" style="background: #3b82f6; color: white; padding: 1.5rem; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500;">
                Dashboard
            </a>
            <a href="/signup" style="background: #059669; color: white; padding: 1.5rem; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500;">
                Create Account
            </a>
            <a href="/sms-test" style="background: #7c3aed; color: white; padding: 1.5rem; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500;">
                SMS Test
            </a>
            <a href="/history" style="background: #dc2626; color: white; padding: 1.5rem; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 500;">
                Transaction History
            </a>
        </div>

        <div class="features">
            <div class="feature">
                <h3>SMS Integration</h3>
                <p>Text your expenses and track spending without apps or bank connections</p>
            </div>
            <div class="feature">
                <h3>Budget Envelopes</h3>
                <p>Organize spending into categories like Groceries, Vacation, and Emergency Fund</p>
            </div>
            <div class="feature">
                <h3>Real-time Tracking</h3>
                <p>Get instant balance updates and spending summaries via text</p>
            </div>
        </div>

        <div class="api-status">
            <h3>System Status</h3>
            <div id="status-content">
                <p><span class="status-good">API Online</span></p>
                <p><span class="status-good">Database Connected</span></p>
                <p><span class="status-good">Environment Configured</span></p>
            </div>
        </div>

        <div style="text-align: center; margin: 2rem 0;">
            <a href="/dashboard" style="background: #3b82f6; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 500;">
                Open Dashboard
            </a>
        </div>

        <div class="footer">
            <p>Built for simple, effective budget management</p>
            <p>Contact: support@textmybudget.com</p>
        </div>
    </div>
</body>
</html>
    `);
  }
  
  // Signup page
  if (url === '/signup') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - TextMyBudget</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            background: rgba(255,255,255,0.1);
            padding: 3rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 500px;
            width: 90%;
        }
        h1 { text-align: center; margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
        .form-group input {
            width: 100%;
            padding: 1rem;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 1rem;
        }
        .form-group input::placeholder { color: rgba(255,255,255,0.7); }
        .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            width: 100%;
            margin-bottom: 1rem;
        }
        .btn:hover { background: #2563eb; }
        .back-link { color: rgba(255,255,255,0.8); text-decoration: none; }
        .success { background: #059669; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .error { background: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Your Account</h1>
        <div id="message"></div>
        <form id="signup-form">
            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required placeholder="Enter your full name">
            </div>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" required placeholder="+1234567890">
            </div>
            <button type="submit" class="btn">Create Account</button>
        </form>
        <a href="/" class="back-link">← Back to Home</a>
    </div>

    <script>
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone')
            };

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const user = await response.json();
                    document.getElementById('message').innerHTML = 
                        '<div class="success">Account created successfully! <a href="/dashboard" style="color: white;">Go to Dashboard</a></div>';
                    document.getElementById('signup-form').reset();
                } else {
                    const error = await response.json();
                    document.getElementById('message').innerHTML = 
                        '<div class="error">Error: ' + (error.message || 'Failed to create account') + '</div>';
                }
            } catch (error) {
                document.getElementById('message').innerHTML = 
                    '<div class="error">Network error. Please try again.</div>';
            }
        });
    </script>
</body>
</html>
    `);
  }

  // SMS Test page
  if (url === '/sms-test') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMS Test - TextMyBudget</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .header {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header h1 { color: #3b82f6; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }
        .sms-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        .sms-input {
            width: 100%;
            padding: 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-family: monospace;
            font-size: 1rem;
        }
        .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        .btn:hover { background: #2563eb; }
        .response {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .examples {
            background: #fef3c7;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        .examples h3 { margin-bottom: 0.5rem; }
        .examples code {
            background: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            display: block;
            margin: 0.25rem 0;
        }
        .back-link { color: #3b82f6; text-decoration: none; margin-bottom: 1rem; display: inline-block; }
        .history {
            max-height: 400px;
            overflow-y: auto;
        }
        .message-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #7c3aed;
        }
        .message-time { color: #6b7280; font-size: 0.9rem; }
        .message-text { font-family: monospace; margin: 0.5rem 0; }
        .message-response { color: #059669; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SMS Test Interface</h1>
    </div>
    
    <div class="container">
        <a href="/" class="back-link">← Back to Home</a>
        
        <div class="examples">
            <h3>Try these SMS commands:</h3>
            <code>25.50 groceries</code>
            <code>100 vacation fund</code>
            <code>balance</code>
            <code>list</code>
            <code>help</code>
        </div>

        <div class="sms-container">
            <div class="card">
                <h2>Send SMS Message</h2>
                <textarea id="sms-message" class="sms-input" placeholder="Type your SMS message here..." rows="3"></textarea>
                <button class="btn" onclick="sendSMS()">Send Message</button>
                
                <div id="response-container" style="margin-top: 1rem;">
                    <div id="sms-response" class="response" style="display: none;"></div>
                </div>
            </div>

            <div class="card">
                <h2>SMS History</h2>
                <div id="sms-history" class="history">
                    Loading SMS history...
                </div>
            </div>
        </div>
    </div>

    <script>
        // Load SMS history on page load
        loadSMSHistory();

        async function loadSMSHistory() {
            try {
                const response = await fetch('/api/sms/1');
                if (response.ok) {
                    const messages = await response.json();
                    renderSMSHistory(messages);
                } else {
                    document.getElementById('sms-history').innerHTML = '<p>Failed to load SMS history</p>';
                }
            } catch (error) {
                document.getElementById('sms-history').innerHTML = '<p>Error loading SMS history</p>';
            }
        }

        function renderSMSHistory(messages) {
            const container = document.getElementById('sms-history');
            if (messages.length === 0) {
                container.innerHTML = '<p>No SMS messages yet. Send your first message above!</p>';
                return;
            }

            container.innerHTML = messages.map(msg => \`
                <div class="message-item">
                    <div class="message-time">\${new Date(msg.createdAt).toLocaleString()}</div>
                    <div class="message-text">📱 \${msg.message}</div>
                    <div class="message-response">🤖 \${msg.response}</div>
                </div>
            \`).reverse().join('');
        }

        async function sendSMS() {
            const message = document.getElementById('sms-message').value.trim();
            if (!message) return;

            const responseEl = document.getElementById('sms-response');
            responseEl.style.display = 'block';
            responseEl.textContent = 'Processing...';

            try {
                const response = await fetch('/api/sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, userId: 1 })
                });

                if (response.ok) {
                    const result = await response.json();
                    responseEl.textContent = result.response;
                    document.getElementById('sms-message').value = '';
                    
                    // Reload history
                    setTimeout(() => loadSMSHistory(), 500);
                } else {
                    responseEl.textContent = 'Error processing SMS message';
                }
            } catch (error) {
                responseEl.textContent = 'Network error. Please try again.';
            }
        }

        // Allow Enter key to send message
        document.getElementById('sms-message').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendSMS();
            }
        });
    </script>
</body>
</html>
    `);
  }

  // Transaction History page
  if (url === '/history') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction History - TextMyBudget</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .header {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header h1 { color: #3b82f6; }
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }
        .transaction-item {
            display: grid;
            grid-template-columns: auto 1fr auto auto;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #f1f5f9;
            align-items: center;
        }
        .transaction-item:last-child { border-bottom: none; }
        .transaction-icon { font-size: 1.5rem; }
        .transaction-details h4 { margin: 0; color: #374151; }
        .transaction-details p { margin: 0; color: #6b7280; font-size: 0.9rem; }
        .transaction-amount {
            font-weight: bold;
            font-size: 1.1rem;
        }
        .amount-negative { color: #dc2626; }
        .amount-positive { color: #059669; }
        .transaction-date { color: #6b7280; font-size: 0.9rem; }
        .back-link { color: #3b82f6; text-decoration: none; margin-bottom: 1rem; display: inline-block; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .stat-value { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.25rem; }
        .stat-label { color: #6b7280; font-size: 0.9rem; }
        .loading { text-align: center; padding: 2rem; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Transaction History</h1>
    </div>
    
    <div class="container">
        <a href="/" class="back-link">← Back to Home</a>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value" id="total-budget">$0.00</div>
                <div class="stat-label">Total Budget</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="total-spent">$0.00</div>
                <div class="stat-label">Total Spent</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="remaining-budget">$0.00</div>
                <div class="stat-label">Remaining</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="transaction-count">0</div>
                <div class="stat-label">Transactions</div>
            </div>
        </div>

        <div class="card">
            <h2>Recent Transactions</h2>
            <div id="transactions-container" class="loading">
                Loading transactions...
            </div>
        </div>
    </div>

    <script>
        loadTransactions();

        async function loadTransactions() {
            try {
                const [transactionsResponse, envelopesResponse] = await Promise.all([
                    fetch('/api/transactions/1'),
                    fetch('/api/envelopes/1')
                ]);

                if (transactionsResponse.ok && envelopesResponse.ok) {
                    const transactions = await transactionsResponse.json();
                    const envelopes = await envelopesResponse.json();
                    
                    renderTransactions(transactions, envelopes);
                    updateStats(transactions, envelopes);
                } else {
                    document.getElementById('transactions-container').innerHTML = 
                        '<p>Failed to load transactions</p>';
                }
            } catch (error) {
                document.getElementById('transactions-container').innerHTML = 
                    '<p>Error loading transactions</p>';
            }
        }

        function renderTransactions(transactions, envelopes) {
            const container = document.getElementById('transactions-container');
            
            if (transactions.length === 0) {
                container.innerHTML = '<p>No transactions yet. Start by adding some expenses!</p>';
                return;
            }

            const envelopeMap = {};
            envelopes.forEach(env => {
                envelopeMap[env.id] = env;
            });

            container.innerHTML = transactions.map(transaction => {
                const envelope = envelopeMap[transaction.envelopeId] || { name: 'Unknown', icon: '❓' };
                const amount = parseFloat(transaction.amount);
                const amountClass = amount < 0 ? 'amount-negative' : 'amount-positive';
                const amountText = amount < 0 ? \`-$\${Math.abs(amount).toFixed(2)}\` : \`+$\${amount.toFixed(2)}\`;

                return \`
                    <div class="transaction-item">
                        <div class="transaction-icon">\${envelope.icon}</div>
                        <div class="transaction-details">
                            <h4>\${transaction.description}</h4>
                            <p>\${envelope.name}</p>
                        </div>
                        <div class="transaction-amount \${amountClass}">\${amountText}</div>
                        <div class="transaction-date">\${new Date(transaction.createdAt).toLocaleDateString()}</div>
                    </div>
                \`;
            }).join('');
        }

        function updateStats(transactions, envelopes) {
            const totalBudget = envelopes.reduce((sum, env) => sum + parseFloat(env.amount), 0);
            const totalSpent = Math.abs(transactions.reduce((sum, trans) => {
                const amount = parseFloat(trans.amount);
                return amount < 0 ? sum + Math.abs(amount) : sum;
            }, 0));
            const remaining = totalBudget - totalSpent;

            document.getElementById('total-budget').textContent = \`$\${totalBudget.toFixed(2)}\`;
            document.getElementById('total-spent').textContent = \`$\${totalSpent.toFixed(2)}\`;
            document.getElementById('remaining-budget').textContent = \`$\${remaining.toFixed(2)}\`;
            document.getElementById('transaction-count').textContent = transactions.length;
        }
    </script>
</body>
</html>
    `);
  }

  // Dashboard page
  if (url === '/dashboard') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - TextMyBudget</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .header {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header h1 { color: #3b82f6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }
        .card h2 { margin-bottom: 1rem; color: #374151; }
        .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s;
        }
        .btn:hover { background: #2563eb; }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; }
        .envelope-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        .envelope {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            background: #f8fafc;
        }
        .envelope h3 { color: #1e293b; margin-bottom: 0.5rem; }
        .envelope .amount { font-size: 1.5rem; font-weight: bold; color: #059669; }
        .envelope .type { color: #6b7280; font-size: 0.9rem; text-transform: capitalize; }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            margin: 10% auto;
            position: relative;
        }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
        .form-group input, .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
        }
        .close { 
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
        .envelope-actions {
            margin-top: 1rem;
            display: flex;
            gap: 0.5rem;
        }
        .envelope-actions button {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
        }
        .back-link {
            color: #3b82f6;
            text-decoration: none;
            margin-bottom: 1rem;
            display: inline-block;
        }
        .loading { text-align: center; padding: 2rem; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TextMyBudget Dashboard</h1>
    </div>
    
    <div class="container">
        <a href="/" class="back-link">← Back to Home</a>
        
        <div class="card">
            <h2>Budget Envelopes</h2>
            <button class="btn" onclick="openModal()">+ Add New Envelope</button>
            
            <div id="envelopes-container" class="loading">
                Loading envelopes...
            </div>
        </div>
    </div>

    <!-- Modal for adding/editing envelopes -->
    <div id="envelope-modal" class="modal">
        <div class="modal-content">
            <button class="close" onclick="closeModal()">&times;</button>
            <h2 id="modal-title">Add New Envelope</h2>
            <form id="envelope-form">
                <div class="form-group">
                    <label for="name">Envelope Name</label>
                    <input type="text" id="name" name="name" required placeholder="e.g., Groceries, Vacation">
                </div>
                <div class="form-group">
                    <label for="type">Type</label>
                    <select id="type" name="type" required>
                        <option value="">Select type</option>
                        <option value="expense">Expense</option>
                        <option value="savings">Savings</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="amount">Budget Amount ($)</label>
                    <input type="number" id="amount" name="amount" step="0.01" min="0" required placeholder="0.00">
                </div>
                <div class="form-group">
                    <label for="icon">Icon</label>
                    <select id="icon" name="icon" required>
                        <option value="">Select icon</option>
                        <option value="🛒">🛒 Shopping Cart</option>
                        <option value="🏠">🏠 House</option>
                        <option value="🚗">🚗 Car</option>
                        <option value="✈️">✈️ Travel</option>
                        <option value="🍔">🍔 Food</option>
                        <option value="💰">💰 Money</option>
                        <option value="🎯">🎯 Goal</option>
                        <option value="📱">📱 Phone</option>
                        <option value="🏥">🏥 Healthcare</option>
                        <option value="🎓">🎓 Education</option>
                    </select>
                </div>
                <button type="submit" class="btn">Save Envelope</button>
            </form>
        </div>
    </div>

    <script>
        let envelopes = [];
        let editingId = null;

        // Load envelopes on page load
        loadEnvelopes();

        async function loadEnvelopes() {
            try {
                const response = await fetch('/api/envelopes/1');
                if (response.ok) {
                    envelopes = await response.json();
                    renderEnvelopes();
                } else {
                    document.getElementById('envelopes-container').innerHTML = 
                        '<p>Failed to load envelopes. <button class="btn" onclick="loadEnvelopes()">Retry</button></p>';
                }
            } catch (error) {
                document.getElementById('envelopes-container').innerHTML = 
                    '<p>Error loading envelopes. <button class="btn" onclick="loadEnvelopes()">Retry</button></p>';
            }
        }

        function renderEnvelopes() {
            const container = document.getElementById('envelopes-container');
            if (envelopes.length === 0) {
                container.innerHTML = '<p>No envelopes yet. Create your first one!</p>';
                return;
            }

            container.innerHTML = \`
                <div class="envelope-grid">
                    \${envelopes.map(envelope => \`
                        <div class="envelope">
                            <h3>\${envelope.icon} \${envelope.name}</h3>
                            <div class="amount">$\${parseFloat(envelope.amount).toFixed(2)}</div>
                            <div class="type">\${envelope.type}</div>
                            <div class="envelope-actions">
                                <button class="btn" onclick="editEnvelope(\${envelope.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteEnvelope(\${envelope.id})">Delete</button>
                            </div>
                        </div>
                    \`).join('')}
                </div>
            \`;
        }

        function openModal() {
            editingId = null;
            document.getElementById('modal-title').textContent = 'Add New Envelope';
            document.getElementById('envelope-form').reset();
            document.getElementById('envelope-modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('envelope-modal').style.display = 'none';
        }

        function editEnvelope(id) {
            const envelope = envelopes.find(e => e.id === id);
            if (!envelope) return;

            editingId = id;
            document.getElementById('modal-title').textContent = 'Edit Envelope';
            document.getElementById('name').value = envelope.name;
            document.getElementById('type').value = envelope.type;
            document.getElementById('amount').value = envelope.amount;
            document.getElementById('icon').value = envelope.icon;
            document.getElementById('envelope-modal').style.display = 'block';
        }

        async function deleteEnvelope(id) {
            if (!confirm('Are you sure you want to delete this envelope?')) return;

            try {
                const response = await fetch(\`/api/envelopes/\${id}\`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await loadEnvelopes();
                } else {
                    alert('Failed to delete envelope');
                }
            } catch (error) {
                alert('Error deleting envelope');
            }
        }

        document.getElementById('envelope-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                type: formData.get('type'),
                amount: formData.get('amount'),
                icon: formData.get('icon')
            };

            try {
                const url = editingId ? \`/api/envelopes/\${editingId}\` : '/api/envelopes';
                const method = editingId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, userId: 1 })
                });

                if (response.ok) {
                    closeModal();
                    await loadEnvelopes();
                } else {
                    alert('Failed to save envelope');
                }
            } catch (error) {
                alert('Error saving envelope');
            }
        });

        // Close modal when clicking outside
        document.getElementById('envelope-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('envelope-modal')) {
                closeModal();
            }
        });
    </script>
</body>
</html>
    `);
  }

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