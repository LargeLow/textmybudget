import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const htmlPath = join(__dirname, 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).send(html);
  } catch (error) {
    res.status(200).json({
      message: "TextMyBudget - SMS Budgeting Platform",
      status: "Coming Soon",
      api: "/api/health for system status",
      contact: "support@textmybudget.com"
    });
  }
}