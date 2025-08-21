import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Ticket, AlertTriangle, DollarSign, RefreshCw, Mail, FileSpreadsheet, Bell, Utensils, ShoppingCart, CreditCard } from "lucide-react";
import Layout from "@/components/layout";
import StatsCard from "@/components/stats-card";
import CategoryCard from "@/components/category-card";
import CouponCard from "@/components/coupon-card";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: categoryStats } = useQuery({
    queryKey: ["/api/categories/stats"],
  });

  const { data: expiringSoonCoupons } = useQuery({
    queryKey: ["/api/coupons/expiring/7"],
  });

  const handleScanEmails = async () => {
    try {
      const response = await fetch('/api/scan-emails', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        alert(`Email scan completed! Scanned ${result.accountsScanned} account(s).`);
      } else {
        alert(result.message || 'Scan failed');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Email scan failed. Please try again.');
    }
  };

  const handleExportSpreadsheet = async () => {
    try {
      const response = await fetch('/api/export/coupons?format=xlsx');
      const result = await response.json();
      
      if (response.ok) {
        console.log('Export data:', result);
        // In a real implementation, this would trigger a file download
        alert(`Export ready! ${result.count} coupons exported.`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleSetReminders = () => {
    setLocation("/settings");
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "food":
        return <Utensils className="text-orange-600" size={20} />;
      case "ecommerce":
        return <ShoppingCart className="text-blue-600" size={20} />;
      case "banking":
        return <CreditCard className="text-green-600" size={20} />;
      default:
        return <Ticket className="text-gray-600" size={20} />;
    }
  };

  const getCategoryIconBg = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "food":
        return "bg-orange-100";
      case "ecommerce":
        return "bg-blue-100";
      case "banking":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-textPrimary mb-2">Welcome back!</h2>
        <p className="text-textSecondary">Here's your coupon summary for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Coupons"
          value={statsLoading ? "..." : stats?.totalCoupons ?? 0}
          icon={<Ticket className="text-primary" size={20} />}
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Expiring Soon"
          value={statsLoading ? "..." : stats?.expiringSoon ?? 0}
          icon={<AlertTriangle className="text-red-600" size={20} />}
          iconBgColor="bg-red-100"
          valueColor="text-red-600"
        />
        <StatsCard
          title="Total Value"
          value={statsLoading ? "..." : stats?.totalValue ?? "₹0"}
          icon={<DollarSign className="text-secondary" size={20} />}
          iconBgColor="bg-green-100"
          valueColor="text-secondary"
        />
        <StatsCard
          title="Last Scan"
          value={statsLoading ? "..." : stats?.lastScan ?? "Never"}
          icon={<RefreshCw className="text-purple-600" size={20} />}
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-textPrimary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleScanEmails}
            className="flex items-center justify-center space-x-3 p-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail size={18} />
            <span className="font-medium">Scan Emails</span>
          </button>
          <button
            onClick={handleExportSpreadsheet}
            className="flex items-center justify-center space-x-3 p-4 bg-secondary text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={18} />
            <span className="font-medium">Export Spreadsheet</span>
          </button>
          <button
            onClick={handleSetReminders}
            className="flex items-center justify-center space-x-3 p-4 bg-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Bell size={18} />
            <span className="font-medium">Set Reminders</span>
          </button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-textPrimary">Categories Overview</h3>
          <button
            onClick={() => setLocation("/categories")}
            className="text-primary hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(categoryStats ?? []).map((category: any) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              count={category.count}
              merchants={category.merchants}
              icon={getCategoryIcon(category.name)}
              iconBgColor={getCategoryIconBg(category.name)}
              onClick={() => setLocation(`/categories/${category.name}`)}
            />
          ))}
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-textPrimary">Expiring Soon</h3>
          <button
            onClick={() => setLocation("/coupons?filter=expiring")}
            className="text-primary hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(expiringSoonCoupons ?? []).slice(0, 3).map((coupon: any) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onView={() => console.log("View coupon:", coupon.id)}
            />
          ))}
        </div>
        {!(expiringSoonCoupons ?? []).length && (
          <div className="text-center py-8 text-textSecondary">
            <Ticket size={48} className="mx-auto mb-4 opacity-50" />
            <p>No coupons expiring soon</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
