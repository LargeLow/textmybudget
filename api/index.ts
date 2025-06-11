import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isInitialized) {
    await registerRoutes(app);
    isInitialized = true;
  }
  
  return app(req, res);
}