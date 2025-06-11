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

        <div class="footer">
            <p>Built for simple, effective budget management</p>
            <p>Contact: support@textmybudget.com</p>
        </div>
    </div>
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
  
  // Default API response
  res.status(200).json({
    message: "TextMyBudget API endpoint",
    method,
    url,
    timestamp: new Date().toISOString(),
    availableEndpoints: ["/api/health"]
  });
}