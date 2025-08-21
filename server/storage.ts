import { type User, type InsertUser, type Coupon, type InsertCoupon, type EmailAccount, type InsertEmailAccount, type ScanSettings, type InsertScanSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Coupon methods
  getCoupons(): Promise<Coupon[]>;
  getCouponById(id: string): Promise<Coupon | undefined>;
  getCouponsByCategory(category: string): Promise<Coupon[]>;
  getExpiringSoonCoupons(days: number): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  
  // Email account methods
  getEmailAccounts(): Promise<EmailAccount[]>;
  createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount>;
  updateEmailAccount(id: string, updates: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined>;
  deleteEmailAccount(id: string): Promise<boolean>;
  
  // Settings methods
  getScanSettings(): Promise<ScanSettings | undefined>;
  createOrUpdateScanSettings(settings: InsertScanSettings): Promise<ScanSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private coupons: Map<string, Coupon>;
  private emailAccounts: Map<string, EmailAccount>;
  private scanSettings: ScanSettings | undefined;

  constructor() {
    this.users = new Map();
    this.coupons = new Map();
    this.emailAccounts = new Map();
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Initialize with some sample data for demonstration
    const sampleCoupons: Coupon[] = [
      {
        id: randomUUID(),
        code: "SAVE200",
        merchant: "Zomato",
        category: "food",
        value: "₹200 off",
        description: "₹200 off on orders above ₹500",
        minimumAmount: "₹500",
        expiryDate: new Date('2024-12-15'),
        isActive: true,
        source: "email",
        createdAt: new Date(),
        usageInstructions: "Valid on food orders only"
      },
      {
        id: randomUUID(),
        code: "FLAT500",
        merchant: "Amazon",
        category: "ecommerce",
        value: "₹500 off",
        description: "₹500 off on electronics",
        minimumAmount: "₹2000",
        expiryDate: new Date('2024-12-18'),
        isActive: true,
        source: "email",
        createdAt: new Date(),
        usageInstructions: "Valid on electronics category only"
      },
      {
        id: randomUUID(),
        code: "CASHBACK100",
        merchant: "HDFC Bank",
        category: "banking",
        value: "10% cashback",
        description: "10% cashback up to ₹500",
        minimumAmount: "₹1000",
        expiryDate: new Date('2024-12-31'),
        isActive: true,
        source: "email",
        createdAt: new Date(),
        usageInstructions: "Valid on online transactions"
      }
    ];

    sampleCoupons.forEach(coupon => {
      this.coupons.set(coupon.id, coupon);
    });

    // Initialize default settings
    this.scanSettings = {
      id: randomUUID(),
      autoScan: true,
      scanFrequency: 6,
      expiryAlerts: true,
      alertDays: "1,3",
      exportFormat: "xlsx",
      includeCategories: true
    };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Coupon methods
  async getCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getCouponById(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponsByCategory(category: string): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).filter(coupon => coupon.category === category);
  }

  async getExpiringSoonCoupons(days: number): Promise<Coupon[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.coupons.values()).filter(coupon => 
      coupon.isActive && coupon.expiryDate > now && coupon.expiryDate <= futureDate
    );
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = { 
      ...insertCoupon, 
      id, 
      createdAt: new Date()
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const existingCoupon = this.coupons.get(id);
    if (!existingCoupon) return undefined;

    const updatedCoupon = { ...existingCoupon, ...updates };
    this.coupons.set(id, updatedCoupon);
    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  // Email account methods
  async getEmailAccounts(): Promise<EmailAccount[]> {
    return Array.from(this.emailAccounts.values());
  }

  async createEmailAccount(insertAccount: InsertEmailAccount): Promise<EmailAccount> {
    const id = randomUUID();
    const account: EmailAccount = { 
      ...insertAccount, 
      id, 
      createdAt: new Date(),
      lastScanAt: null
    };
    this.emailAccounts.set(id, account);
    return account;
  }

  async updateEmailAccount(id: string, updates: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined> {
    const existingAccount = this.emailAccounts.get(id);
    if (!existingAccount) return undefined;

    const updatedAccount = { ...existingAccount, ...updates };
    this.emailAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteEmailAccount(id: string): Promise<boolean> {
    return this.emailAccounts.delete(id);
  }

  // Settings methods
  async getScanSettings(): Promise<ScanSettings | undefined> {
    return this.scanSettings;
  }

  async createOrUpdateScanSettings(settings: InsertScanSettings): Promise<ScanSettings> {
    if (this.scanSettings) {
      this.scanSettings = { ...this.scanSettings, ...settings };
    } else {
      this.scanSettings = { id: randomUUID(), ...settings };
    }
    return this.scanSettings;
  }
}

export const storage = new MemStorage();
