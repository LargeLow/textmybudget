export default function handler(req: any, res: any) {
  const { method, url } = req;
  
  // Route handling
  if (url === '/api/health' || url === '/') {
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      hasDatabase: !!process.env.DATABASE_URL,
      hasSession: !!process.env.SESSION_SECRET,
      version: "1.0.0",
      message: "TextMyBudget API is running"
    });
  }
  
  // Default response for all other routes
  res.status(200).json({
    message: "TextMyBudget API endpoint",
    method,
    url,
    timestamp: new Date().toISOString()
  });
}