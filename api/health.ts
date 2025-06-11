export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    hasDatabase: !!process.env.DATABASE_URL,
    hasSession: !!process.env.SESSION_SECRET,
    version: "1.0.0"
  });
}