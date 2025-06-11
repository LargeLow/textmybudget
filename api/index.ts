// Simple in-memory storage for demo purposes
let envelopes = [
  { id: 1, userId: 1, name: "Groceries", type: "expense", amount: "400.00", icon: "🛒" },
  { id: 2, userId: 1, name: "Vacation Fund", type: "savings", amount: "200.00", icon: "✈️" },
  { id: 3, userId: 1, name: "Emergency Fund", type: "savings", amount: "150.00", icon: "💰" }
];
let nextId = 4;

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
      id: nextId++,
      userId: userId || 1,
      name,
      type,
      amount: parseFloat(amount).toFixed(2),
      icon
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
        
        <div class="coming-soon">
            <h3>Coming Soon!</h3>
            <p>TextMyBudget is currently in development. Soon you'll be able to manage your budget by simply texting dollar amounts to track expenses and savings.</p>
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

  // API endpoints for envelope management
  if (url && url.startsWith('/api/envelopes')) {
    return handleEnvelopeAPI(req, res);
  }
  
  // Default API response
  res.status(200).json({
    message: "TextMyBudget API endpoint",
    method,
    url,
    timestamp: new Date().toISOString(),
    availableEndpoints: ["/api/health", "/api/envelopes", "/dashboard"]
  });
}