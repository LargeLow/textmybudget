import { 
  users, 
  envelopes, 
  transactions,
  type User, 
  type InsertUser,
  type Envelope,
  type InsertEnvelope,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Envelopes
  getEnvelopesByUserId(userId: number): Promise<Envelope[]>;
  getEnvelopeById(id: number): Promise<Envelope | undefined>;
  getEnvelopeByName(userId: number, name: string): Promise<Envelope | undefined>;
  createEnvelope(userId: number, envelope: InsertEnvelope): Promise<Envelope>;
  updateEnvelopeAmount(id: number, amount: string): Promise<Envelope | undefined>;
  
  // Transactions
  getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]>;
  getTransactionsByEnvelopeId(envelopeId: number): Promise<Transaction[]>;
  createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEnvelopesByUserId(userId: number): Promise<Envelope[]> {
    return await db.select().from(envelopes)
      .where(and(eq(envelopes.userId, userId), eq(envelopes.isActive, true)))
      .orderBy(envelopes.createdAt);
  }

  async getEnvelopeById(id: number): Promise<Envelope | undefined> {
    const [envelope] = await db.select().from(envelopes).where(eq(envelopes.id, id));
    return envelope || undefined;
  }

  async getEnvelopeByName(userId: number, name: string): Promise<Envelope | undefined> {
    const [envelope] = await db.select().from(envelopes)
      .where(and(eq(envelopes.userId, userId), eq(envelopes.name, name)));
    return envelope || undefined;
  }

  async createEnvelope(userId: number, envelope: InsertEnvelope): Promise<Envelope> {
    const [newEnvelope] = await db
      .insert(envelopes)
      .values({
        ...envelope,
        userId,
        budgetAmount: envelope.budgetAmount.toString(),
      })
      .returning();
    return newEnvelope;
  }

  async updateEnvelopeAmount(id: number, amount: string): Promise<Envelope | undefined> {
    const [updatedEnvelope] = await db
      .update(envelopes)
      .set({ currentAmount: amount })
      .where(eq(envelopes.id, id))
      .returning();
    return updatedEnvelope || undefined;
  }

  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    let query = db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getTransactionsByEnvelopeId(envelopeId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.envelopeId, envelopeId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        ...transaction,
        userId,
        amount: transaction.amount.toString(),
      })
      .returning();

    // Update envelope amount
    const envelope = await this.getEnvelopeById(transaction.envelopeId);
    if (envelope) {
      const currentAmount = parseFloat(envelope.currentAmount);
      const transactionAmount = parseFloat(newTransaction.amount);
      const newAmount = currentAmount + transactionAmount;
      await this.updateEnvelopeAmount(transaction.envelopeId, newAmount.toString());
    }

    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    // Get the old transaction first to calculate envelope amount changes
    const oldTransaction = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!oldTransaction[0]) return undefined;

    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        ...transaction,
        amount: transaction.amount?.toString(),
      })
      .where(eq(transactions.id, id))
      .returning();

    // Update envelope amounts if the transaction amount changed
    if (transaction.amount !== undefined && updatedTransaction) {
      const envelope = await this.getEnvelopeById(updatedTransaction.envelopeId);
      if (envelope) {
        const currentAmount = parseFloat(envelope.currentAmount);
        const oldAmount = parseFloat(oldTransaction[0].amount);
        const newAmount = parseFloat(updatedTransaction.amount);
        const adjustedAmount = currentAmount - oldAmount + newAmount;
        await this.updateEnvelopeAmount(updatedTransaction.envelopeId, adjustedAmount.toString());
      }
    }

    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    // Get the transaction first to update envelope amount
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!transaction) return false;

    // Update envelope amount by removing this transaction
    const envelope = await this.getEnvelopeById(transaction.envelopeId);
    if (envelope) {
      const currentAmount = parseFloat(envelope.currentAmount);
      const transactionAmount = parseFloat(transaction.amount);
      const newAmount = currentAmount - transactionAmount;
      await this.updateEnvelopeAmount(transaction.envelopeId, newAmount.toString());
    }

    // Delete the transaction
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return true;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private envelopes: Map<number, Envelope> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private currentUserId = 1;
  private currentEnvelopeId = 1;
  private currentTransactionId = 1;

  constructor() {
    // Create demo user
    const demoUser: User = {
      id: 1,
      username: "demo",
      password: "demo123",
      phoneNumber: "+1234567890",
      smsNumber: "+15551234567"
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Envelopes
  async getEnvelopesByUserId(userId: number): Promise<Envelope[]> {
    return Array.from(this.envelopes.values())
      .filter(envelope => envelope.userId === userId && envelope.isActive)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getEnvelopeById(id: number): Promise<Envelope | undefined> {
    return this.envelopes.get(id);
  }

  async getEnvelopeByName(userId: number, name: string): Promise<Envelope | undefined> {
    return Array.from(this.envelopes.values())
      .find(envelope => 
        envelope.userId === userId && 
        envelope.name.toLowerCase() === name.toLowerCase() && 
        envelope.isActive
      );
  }

  async createEnvelope(userId: number, envelope: InsertEnvelope): Promise<Envelope> {
    const id = this.currentEnvelopeId++;
    const newEnvelope: Envelope = {
      ...envelope,
      id,
      userId,
      budgetAmount: envelope.budgetAmount.toString(),
      currentAmount: "0",
      isActive: true,
      createdAt: new Date(),
    };
    this.envelopes.set(id, newEnvelope);
    return newEnvelope;
  }

  async updateEnvelopeAmount(id: number, amount: string): Promise<Envelope | undefined> {
    const envelope = this.envelopes.get(id);
    if (!envelope) return undefined;

    const updatedEnvelope = { ...envelope, currentAmount: amount };
    this.envelopes.set(id, updatedEnvelope);
    return updatedEnvelope;
  }

  // Transactions
  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async getTransactionsByEnvelopeId(envelopeId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.envelopeId === envelopeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(userId: number, transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      userId,
      amount: transaction.amount.toString(),
      description: transaction.description || null,
      source: transaction.source || "web",
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);

    // Update envelope amount
    const envelope = await this.getEnvelopeById(transaction.envelopeId);
    if (envelope) {
      const currentAmount = parseFloat(envelope.currentAmount);
      const transactionAmount = parseFloat(newTransaction.amount);
      const newAmount = currentAmount + transactionAmount;
      await this.updateEnvelopeAmount(transaction.envelopeId, newAmount.toString());
    }

    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;

    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...transaction,
      amount: transaction.amount?.toString() || existingTransaction.amount,
      description: transaction.description !== undefined ? transaction.description : existingTransaction.description,
      source: transaction.source || existingTransaction.source,
    };

    // Update envelope amounts if the transaction amount changed
    if (transaction.amount !== undefined) {
      const envelope = await this.getEnvelopeById(existingTransaction.envelopeId);
      if (envelope) {
        const currentAmount = parseFloat(envelope.currentAmount);
        const oldAmount = parseFloat(existingTransaction.amount);
        const newAmount = parseFloat(updatedTransaction.amount);
        const adjustedAmount = currentAmount - oldAmount + newAmount;
        await this.updateEnvelopeAmount(existingTransaction.envelopeId, adjustedAmount.toString());
      }
    }

    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;

    // Update envelope amount by removing this transaction
    const envelope = await this.getEnvelopeById(transaction.envelopeId);
    if (envelope) {
      const currentAmount = parseFloat(envelope.currentAmount);
      const transactionAmount = parseFloat(transaction.amount);
      const newAmount = currentAmount - transactionAmount;
      await this.updateEnvelopeAmount(transaction.envelopeId, newAmount.toString());
    }

    return this.transactions.delete(id);
  }
}

export const storage = new DatabaseStorage();
