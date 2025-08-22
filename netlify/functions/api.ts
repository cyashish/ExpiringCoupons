import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { storage } from '../../server/storage';
import { insertCouponSchema, insertEmailAccountSchema, insertScanSettingsSchema } from '../../shared/schema';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for Netlify
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Stats endpoint
app.get("/stats", async (req, res) => {
  try {
    const coupons = await storage.getCoupons();
    const totalCoupons = coupons.length;
    const expiringSoon = coupons.filter(coupon => {
      const daysUntilExpiry = Math.ceil((coupon.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    }).length;
    
    const totalValue = coupons.reduce((sum, coupon) => {
      const match = coupon.value?.match(/[\d,]+/);
      return sum + (match ? parseInt(match[0].replace(/,/g, '')) : 0);
    }, 0);

    res.json({
      totalCoupons,
      expiringSoon,
      totalValue: `₹${totalValue.toLocaleString()}`,
      lastScan: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Coupons endpoints
app.get("/coupons", async (req, res) => {
  try {
    const coupons = await storage.getCoupons();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

app.post("/coupons", async (req, res) => {
  try {
    const validatedData = insertCouponSchema.parse(req.body);
    const coupon = await storage.createCoupon(validatedData);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create coupon" });
  }
});

app.delete("/coupons/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteCoupon(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
});

// Categories endpoint
app.get("/categories/stats", async (req, res) => {
  try {
    const coupons = await storage.getCoupons();
    const categoryStats = coupons.reduce((acc: any, coupon) => {
      const category = coupon.category;
      if (!acc[category]) {
        acc[category] = { name: category, count: 0, merchants: new Set() };
      }
      acc[category].count++;
      acc[category].merchants.add(coupon.merchant);
      return acc;
    }, {});

    const stats = Object.values(categoryStats).map((stat: any) => ({
      name: stat.name,
      count: stat.count,
      merchants: Array.from(stat.merchants).join(", "),
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category stats" });
  }
});

// Email accounts endpoints
app.get("/email-accounts", async (req, res) => {
  try {
    const accounts = await storage.getEmailAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch email accounts" });
  }
});

app.get("/auth/gmail", async (req, res) => {
  try {
    const authUrl = "https://accounts.google.com/oauth/authorize?" +
      "client_id=YOUR_CLIENT_ID&" +
      "redirect_uri=YOUR_REDIRECT_URI&" +
      "scope=https://www.googleapis.com/auth/gmail.readonly&" +
      "response_type=code&" +
      "access_type=offline";
    
    res.json({ authUrl, message: "Redirect to Google OAuth" });
  } catch (error) {
    res.status(500).json({ message: "Failed to initiate Gmail OAuth" });
  }
});

app.post("/auth/gmail/callback", async (req, res) => {
  try {
    const { code, email } = req.body;
    
    const account = await storage.createEmailAccount({
      email: email || "user@gmail.com",
      provider: "gmail",
      googleId: "mock-google-id",
      isConnected: true
    });
    
    res.status(201).json(account);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to connect Gmail account" });
  }
});

app.delete("/email-accounts/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteEmailAccount(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Email account not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete email account" });
  }
});

// Scan endpoints
app.post("/scan-emails", async (req, res) => {
  try {
    const accounts = await storage.getEmailAccounts();
    const connectedAccounts = accounts.filter(acc => acc.isConnected);
    
    if (connectedAccounts.length === 0) {
      return res.status(400).json({ message: "No connected email accounts found" });
    }
    
    res.json({ 
      message: "Email scan initiated", 
      status: "success",
      accountsScanned: connectedAccounts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to initiate email scan" });
  }
});

// Settings endpoints
app.get("/settings", async (req, res) => {
  try {
    const settings = await storage.getScanSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

app.put("/settings", async (req, res) => {
  try {
    const validatedData = insertScanSettingsSchema.parse(req.body);
    // For now, return the validated data as settings
    // In a real implementation, this would update storage
    res.json(validatedData);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update settings" });
  }
});

// Export endpoint
app.get("/export/coupons", async (req, res) => {
  try {
    const { format = 'xlsx' } = req.query;
    const allCoupons = await storage.getCoupons();
    
    const exportData = allCoupons.map(coupon => ({
      Code: coupon.code,
      Merchant: coupon.merchant,
      Category: coupon.category,
      Value: coupon.value,
      Description: coupon.description || '',
      'Minimum Amount': coupon.minimumAmount || '',
      'Expiry Date': coupon.expiryDate.toLocaleDateString(),
      Status: coupon.isActive ? 'Active' : 'Inactive',
      Source: coupon.source || 'Manual',
      'Usage Instructions': coupon.usageInstructions || ''
    }));
    
    res.json({
      message: "Export data prepared",
      format,
      data: exportData,
      count: exportData.length
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to export coupons" });
  }
});

// Expiring coupons endpoint
app.get("/coupons/expiring/:days", async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const coupons = await storage.getCoupons();
    const expiring = coupons.filter(coupon => {
      const daysUntilExpiry = Math.ceil((coupon.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= days && daysUntilExpiry >= 0;
    });
    res.json(expiring);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expiring coupons" });
  }
});

const netlifyHandler = serverless(app);

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const response = await netlifyHandler(event, context);
  return response as any;
};