import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Download, Trash2 } from "lucide-react";
import Layout from "@/components/layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AllCoupons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["/api/coupons"],
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (couponId: string) => apiRequest("DELETE", `/api/coupons/${couponId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  const filteredCoupons = coupons?.filter((coupon: any) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || coupon.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = coupon.isActive && new Date(coupon.expiryDate) > new Date();
    } else if (statusFilter === "expiring") {
      const daysUntilExpiry = Math.ceil((new Date(coupon.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      matchesStatus = daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    } else if (statusFilter === "expired") {
      matchesStatus = new Date(coupon.expiryDate) < new Date();
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const handleExportCoupons = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export Started",
      description: "Your coupon data is being exported",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food":
        return "🍽️";
      case "ecommerce":
        return "🛒";
      case "banking":
        return "💳";
      case "travel":
        return "✈️";
      default:
        return "🎫";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "food":
        return "bg-orange-100 text-orange-800";
      case "ecommerce":
        return "bg-blue-100 text-blue-800";
      case "banking":
        return "bg-green-100 text-green-800";
      case "travel":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) {
      return { status: "Expired", color: "bg-red-100 text-red-800" };
    } else if (daysUntilExpiry <= 7) {
      return { status: "Expiring Soon", color: "bg-red-100 text-red-800" };
    } else {
      return { status: "Active", color: "bg-green-100 text-green-800" };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">All Coupons</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" size={18} />
              <input
                type="text"
                placeholder="Search coupons..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="food">Food & Dining</option>
              <option value="ecommerce">E-commerce</option>
              <option value="banking">Banking</option>
              <option value="travel">Travel</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
            <button
              onClick={handleExportCoupons}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Coupon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-gray-200">
                {filteredCoupons.map((coupon: any) => {
                  const expiryStatus = getExpiryStatus(coupon.expiryDate);
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">
                            {getCategoryIcon(coupon.category)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-textPrimary">
                              {coupon.code}
                            </div>
                            <div className="text-sm text-textSecondary">
                              {coupon.merchant}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(coupon.category)}`}>
                          {coupon.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                        {coupon.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                          {expiryStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-primary hover:text-blue-700 mr-4"
                          onClick={() => console.log("View details:", coupon.id)}
                        >
                          View
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteCouponMutation.mutate(coupon.id)}
                          disabled={deleteCouponMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredCoupons.length === 0 && (
            <div className="text-center py-12 text-textSecondary">
              <div className="text-4xl mb-4">🎫</div>
              <p className="text-lg font-medium mb-2">No coupons found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
