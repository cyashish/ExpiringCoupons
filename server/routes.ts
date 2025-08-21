import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCouponSchema, insertSmsAccountSchema, insertScanSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Coupon routes
  app.get("/api/coupons", async (req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.get("/api/coupons/:id", async (req, res) => {
    try {
      const coupon = await storage.getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });

  app.get("/api/coupons/category/:category", async (req, res) => {
    try {
      const coupons = await storage.getCouponsByCategory(req.params.category);
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons by category" });
    }
  });

  app.get("/api/coupons/expiring/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      const coupons = await storage.getExpiringSoonCoupons(days);
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring coupons" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create coupon" });
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const validatedData = insertCouponSchema.partial().parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, validatedData);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update coupon" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
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

  // SMS account routes
  app.get("/api/sms-accounts", async (req, res) => {
    try {
      const accounts = await storage.getSmsAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SMS accounts" });
    }
  });

  app.post("/api/sms-accounts", async (req, res) => {
    try {
      const validatedData = insertSmsAccountSchema.parse(req.body);
      const account = await storage.createSmsAccount(validatedData);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create SMS account" });
    }
  });

  app.delete("/api/sms-accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSmsAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "SMS account not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete SMS account" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getScanSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertScanSettingsSchema.parse(req.body);
      const settings = await storage.createOrUpdateScanSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update settings" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const allCoupons = await storage.getCoupons();
      const expiringSoon = await storage.getExpiringSoonCoupons(7);
      const activeCoupons = allCoupons.filter(c => c.isActive);
      
      // Calculate total value (simplified - just count coupons with discount values)
      const totalValue = activeCoupons.reduce((sum, coupon) => {
        const match = coupon.value.match(/₹(\d+)/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0);

      const stats = {
        totalCoupons: activeCoupons.length,
        expiringSoon: expiringSoon.length,
        totalValue: `₹${totalValue.toLocaleString()}`,
        lastScan: "2h ago" // This would be dynamic based on actual scan times
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Category statistics
  app.get("/api/categories/stats", async (req, res) => {
    try {
      const allCoupons = await storage.getCoupons();
      const activeCoupons = allCoupons.filter(c => c.isActive);
      
      const categoryStats = activeCoupons.reduce((acc: any, coupon) => {
        if (!acc[coupon.category]) {
          acc[coupon.category] = {
            name: coupon.category,
            count: 0,
            merchants: new Set()
          };
        }
        acc[coupon.category].count++;
        acc[coupon.category].merchants.add(coupon.merchant);
        return acc;
      }, {});

      // Convert to array and format
      const result = Object.values(categoryStats).map((cat: any) => ({
        name: cat.name,
        count: cat.count,
        merchants: Array.from(cat.merchants).slice(0, 3).join(", ")
      }));

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category statistics" });
    }
  });

  // SMS scanning endpoint (webhook or API integration)
  app.post("/api/scan-sms", async (req, res) => {
    try {
      // TODO: Implement actual SMS scanning logic
      // This would integrate with Twilio webhooks or other SMS providers
      res.json({ message: "SMS scan initiated", status: "success" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate SMS scan" });
    }
  });

  // Webhook endpoint for receiving SMS data
  app.post("/api/webhooks/sms", async (req, res) => {
    try {
      // TODO: Parse incoming SMS data and extract coupon information
      // This would be called by SMS providers like Twilio
      const { from, body } = req.body;
      
      // Extract coupon information from SMS body
      // For now, just acknowledge receipt
      res.json({ message: "SMS webhook processed", status: "success" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process SMS webhook" });
    }
  });

  // Export coupons endpoint
  app.get("/api/export/coupons", async (req, res) => {
    try {
      const { format = 'xlsx' } = req.query;
      const allCoupons = await storage.getCoupons();
      
      // For demonstration, return JSON data
      // In a real implementation, this would generate Excel/CSV files
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

  const httpServer = createServer(app);
  return httpServer;
}
