import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEnvelopeSchema, insertTransactionSchema } from "@shared/schema";
import { parseSMSMessage, parseSMSMessageWithSuggestion } from "../client/src/lib/sms-parser";

// Simple in-memory session store for SMS interactions
interface PendingTransaction {
  envelopeName: string;
  amount: number;
  timestamp: number;
}

const pendingSMSTransactions = new Map<string, PendingTransaction>();

// Clean up old sessions (older than 5 minutes)
function cleanupOldSessions() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const phonesToDelete: string[] = [];
  
  pendingSMSTransactions.forEach((session, phone) => {
    if (session.timestamp < fiveMinutesAgo) {
      phonesToDelete.push(phone);
    }
  });
  
  phonesToDelete.forEach(phone => {
    pendingSMSTransactions.delete(phone);
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user envelopes
  app.get("/api/envelopes/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const envelopes = await storage.getEnvelopesByUserId(userId);
      res.json(envelopes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch envelopes" });
    }
  });

  // Create envelope
  app.post("/api/envelopes/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validatedData = insertEnvelopeSchema.parse(req.body);
      const envelope = await storage.createEnvelope(userId, validatedData);
      res.json(envelope);
    } catch (error) {
      res.status(400).json({ message: "Invalid envelope data" });
    }
  });

  // Get user transactions
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getTransactionsByUserId(userId, limit);
      
      // Get envelope names for transactions
      const transactionsWithEnvelopes = await Promise.all(
        transactions.map(async (transaction) => {
          const envelope = await storage.getEnvelopeById(transaction.envelopeId);
          return {
            ...transaction,
            envelopeName: envelope?.name || "Unknown",
            envelopeIcon: envelope?.icon || "wallet",
            envelopeType: envelope?.type || "expense"
          };
        })
      );

      res.json(transactionsWithEnvelopes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create transaction
  app.post("/api/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(userId, validatedData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Update transaction
  app.put("/api/transactions/:transactionId", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(transactionId, validatedData);
      if (!transaction) {
        res.status(404).json({ message: "Transaction not found" });
        return;
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:transactionId", async (req, res) => {
    try {
      const transactionId = parseInt(req.params.transactionId);
      const success = await storage.deleteTransaction(transactionId);
      if (!success) {
        res.status(404).json({ message: "Transaction not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Get user stats
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const envelopes = await storage.getEnvelopesByUserId(userId);
      
      const expenseEnvelopes = envelopes.filter(e => e.type === "expense");
      const savingsEnvelopes = envelopes.filter(e => e.type === "savings");

      const totalBudget = expenseEnvelopes.reduce((sum, e) => sum + parseFloat(e.budgetAmount), 0);
      const totalSpent = expenseEnvelopes.reduce((sum, e) => sum + parseFloat(e.currentAmount), 0);
      const totalSaved = savingsEnvelopes.reduce((sum, e) => sum + parseFloat(e.currentAmount), 0);
      const remaining = totalBudget - totalSpent;

      res.json({
        totalBudget,
        totalSpent,
        totalSaved,
        remaining
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // SMS authentication and command processing
  app.post("/api/sms/webhook", async (req, res) => {
    try {
      const { Body: message, From: phoneNumber } = req.body;
      
      // Clean phone number format for lookup
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      
      // Find user by phone number or SMS number
      let user;
      const allUsers = await Promise.all([1].map(id => storage.getUser(id))); // In production, query all users
      for (const u of allUsers) {
        if (u && (
          u.phoneNumber?.replace(/[^\d]/g, '') === cleanPhone ||
          u.smsNumber?.replace(/[^\d]/g, '') === cleanPhone
        )) {
          user = u;
          break;
        }
      }
      
      if (!user) {
        res.status(404).json({ 
          message: "Phone number not registered. Please sign up on the web app first." 
        });
        return;
      }

      const userId = user.id;

      // Clean up old sessions periodically
      cleanupOldSessions();

      // Check for simple add/subtract responses to pending transactions
      const lowerMessage = message.toLowerCase().trim();
      const pendingTransaction = pendingSMSTransactions.get(cleanPhone);
      
      if (pendingTransaction && (lowerMessage === "add" || lowerMessage === "subtract")) {
        const { envelopeName, amount } = pendingTransaction;
        
        // Find envelope
        const envelope = await storage.getEnvelopeByName(userId, envelopeName);
        if (!envelope) {
          pendingSMSTransactions.delete(cleanPhone);
          res.status(404).json({ 
            message: `Envelope '${envelopeName}' not found. Session cleared.` 
          });
          return;
        }

        // Determine transaction type based on user response and envelope type
        let transactionAmount: number;
        let actionType: string;
        
        if (lowerMessage === "add") {
          if (envelope.type === "expense") {
            // Adding to expense envelope means spending more
            transactionAmount = Math.abs(amount);
            actionType = "Spent";
          } else {
            // Adding to savings envelope means saving more
            transactionAmount = Math.abs(amount);
            actionType = "Saved";
          }
        } else { // subtract
          if (envelope.type === "expense") {
            // Subtracting from expense envelope means reducing spending (negative expense)
            transactionAmount = -Math.abs(amount);
            actionType = "Reduced spending by";
          } else {
            // Subtracting from savings envelope means taking money out (negative savings)
            transactionAmount = -Math.abs(amount);
            actionType = "Withdrew";
          }
        }
        await storage.createTransaction(userId, {
          envelopeId: envelope.id,
          amount: transactionAmount,
          description: `SMS: ${envelopeName} ${transactionAmount >= 0 ? "+" : "-"}$${Math.abs(amount)}`,
          source: "sms"
        });

        // Calculate new balance and clear session
        const newBalance = parseFloat(envelope.currentAmount) + transactionAmount;
        pendingSMSTransactions.delete(cleanPhone);
        
        res.json({ 
          message: `${actionType} $${Math.abs(amount).toFixed(2)} ${envelope.type === "expense" ? (transactionAmount >= 0 ? "from" : "back to") : (transactionAmount >= 0 ? "to" : "from")} ${envelopeName}. New balance: $${Math.abs(newBalance).toFixed(2)}` 
        });
        return;
      }

      // Check for login command
      if (message.toLowerCase().trim() === "login") {
        // Generate a simple login token (in production, use proper JWT or secure tokens)
        const loginToken = Math.random().toString(36).substr(2, 9);
        // Store token temporarily (in production, use Redis or database)
        // For now, just return success
        res.json({ 
          message: `Login successful! You can now text commands to manage your budget. Text 'help' for available commands.` 
        });
        return;
      }

      // Check for help command
      if (message.toLowerCase().trim() === "help") {
        res.json({ 
          message: `Commands:\n• "Groceries -$25.50" (record expense)\n• "Vacation +$100" (add to savings)\n• "balance Groceries" (check envelope balance)\n• "list" (show all envelopes)\n• "login" (authenticate for web access)` 
        });
        return;
      }

      // Check for list command
      if (message.toLowerCase().trim() === "list") {
        const envelopes = await storage.getEnvelopesByUserId(userId);
        if (envelopes.length === 0) {
          res.json({ 
            message: "You don't have any envelopes yet. Create some in the web app!" 
          });
          return;
        }

        const envelopeList = envelopes.map(env => {
          const current = parseFloat(env.currentAmount);
          const budget = parseFloat(env.budgetAmount);
          const type = env.type === "expense" ? "💸" : "💰";
          
          if (env.type === "expense") {
            const remaining = budget - current;
            return `${type} ${env.name}: $${current.toFixed(2)}/$${budget.toFixed(2)} (${remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`})`;
          } else {
            const progress = budget > 0 ? Math.round((current / budget) * 100) : 0;
            return `${type} ${env.name}: $${current.toFixed(2)}/$${budget.toFixed(2)} (${progress}% saved)`;
          }
        }).join('\n');

        res.json({ 
          message: `Your Envelopes:\n${envelopeList}` 
        });
        return;
      }

      // Check for balance command
      const balanceMatch = message.match(/^balance\s+(.+)$/i);
      if (balanceMatch) {
        const envelopeName = balanceMatch[1].trim();
        const envelope = await storage.getEnvelopeByName(userId, envelopeName);
        if (!envelope) {
          res.status(404).json({ 
            message: `Envelope '${envelopeName}' not found.` 
          });
          return;
        }
        
        const current = parseFloat(envelope.currentAmount);
        const budget = parseFloat(envelope.budgetAmount);
        
        if (envelope.type === "expense") {
          const remaining = budget - current;
          res.json({ 
            message: `${envelopeName}: $${current.toFixed(2)} spent of $${budget.toFixed(2)} budget. $${remaining.toFixed(2)} remaining.` 
          });
        } else {
          const progress = budget > 0 ? Math.round((current / budget) * 100) : 0;
          res.json({ 
            message: `${envelopeName}: $${current.toFixed(2)} saved of $${budget.toFixed(2)} goal (${progress}% complete).` 
          });
        }
        return;
      }

      // Parse SMS transaction message with enhanced suggestion
      const parseResult = parseSMSMessageWithSuggestion(message);
      if (!parseResult.success) {
        if (parseResult.suggestion) {
          // Store the pending transaction for follow-up
          const missingSignMatch = message.match(/^(.+?)\s*\$?(\d+(?:\.\d{2})?)$/i);
          if (missingSignMatch) {
            const envelopeName = missingSignMatch[1].trim();
            const amount = parseFloat(missingSignMatch[2]);
            
            pendingSMSTransactions.set(cleanPhone, {
              envelopeName,
              amount,
              timestamp: Date.now()
            });
            
            res.status(400).json({ 
              message: `${parseResult.suggestion}\n\nOr simply reply "add" or "subtract" to complete this transaction.`
            });
            return;
          }
        }
        
        const errorMessage = parseResult.suggestion || "Invalid format. Try: 'Groceries -$25.50' or 'Vacation +$100'. Text 'help' for all commands.";
        res.status(400).json({ 
          message: errorMessage
        });
        return;
      }

      const parsed = parseResult.data!;

      const { envelopeName, amount, type } = parsed;

      // Find envelope
      const envelope = await storage.getEnvelopeByName(userId, envelopeName);
      if (!envelope) {
        res.status(404).json({ 
          message: `Envelope '${envelopeName}' not found. Create it in the web app first.` 
        });
        return;
      }

      // Validate transaction type matches envelope type
      if ((type === "expense" && envelope.type === "savings") || 
          (type === "savings" && envelope.type === "expense")) {
        res.status(400).json({ 
          message: `Cannot ${type === "expense" ? "spend from" : "save to"} ${envelope.type} envelope '${envelopeName}'` 
        });
        return;
      }

      // Create transaction
      const transactionAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);
      await storage.createTransaction(userId, {
        envelopeId: envelope.id,
        amount: transactionAmount,
        description: `SMS: ${message}`,
        source: "sms"
      });

      // Calculate new balance
      const newBalance = parseFloat(envelope.currentAmount) + transactionAmount;
      res.json({ 
        message: `${type === "expense" ? "Spent" : "Saved"} $${Math.abs(amount).toFixed(2)} ${type === "expense" ? "from" : "to"} ${envelopeName}. New balance: $${Math.abs(newBalance).toFixed(2)}` 
      });

    } catch (error) {
      console.error("SMS webhook error:", error);
      res.status(500).json({ message: "Failed to process SMS" });
    }
  });

  // Get user info
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      // Don't send password
      const { password, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
