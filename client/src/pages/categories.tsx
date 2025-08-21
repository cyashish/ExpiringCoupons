import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Utensils, ShoppingCart, CreditCard, Plane, ArrowRight } from "lucide-react";
import Layout from "@/components/layout";
import CategoryCard from "@/components/category-card";
import CouponCard from "@/components/coupon-card";

export default function Categories() {
  const [, setLocation] = useLocation();

  const { data: categoryStats } = useQuery({
    queryKey: ["/api/categories/stats"],
  });

  const { data: allCoupons } = useQuery({
    queryKey: ["/api/coupons"],
  });

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "food":
        return <Utensils className="text-orange-600" size={20} />;
      case "ecommerce":
        return <ShoppingCart className="text-blue-600" size={20} />;
      case "banking":
        return <CreditCard className="text-green-600" size={20} />;
      case "travel":
        return <Plane className="text-purple-600" size={20} />;
      default:
        return <div className="w-5 h-5 bg-gray-600 rounded"></div>;
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
      case "travel":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  const getCategoryDisplayName = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "food":
        return "Food & Dining";
      case "ecommerce":
        return "E-commerce";
      case "banking":
        return "Banking";
      case "travel":
        return "Travel";
      default:
        return categoryName;
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-textPrimary mb-2">Categories</h2>
        <p className="text-textSecondary">Browse coupons by category</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(categoryStats ?? []).map((category: any) => (
          <CategoryCard
            key={category.name}
            name={getCategoryDisplayName(category.name)}
            count={category.count}
            merchants={category.merchants}
            icon={getCategoryIcon(category.name)}
            iconBgColor={getCategoryIconBg(category.name)}
            onClick={() => setLocation(`/categories/${category.name}`)}
          />
        ))}
      </div>

      {/* Recent Coupons by Category */}
      {(categoryStats ?? []).map((category: any) => {
        const categoryCoupons = (allCoupons ?? []).filter((coupon: any) => 
          coupon.category === category.name
        ).slice(0, 3);

        if (categoryCoupons.length === 0) return null;

        return (
          <div key={category.name} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary">
                Recent {getCategoryDisplayName(category.name)} Coupons
              </h3>
              <button
                onClick={() => setLocation(`/categories/${category.name}`)}
                className="text-primary hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryCoupons.map((coupon: any) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onView={() => console.log("View coupon:", coupon.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {!(categoryStats ?? []).length && (
        <div className="text-center py-12 text-textSecondary">
          <div className="text-4xl mb-4">📂</div>
          <p className="text-lg font-medium mb-2">No categories found</p>
          <p className="text-sm">Add some coupons to see categories</p>
        </div>
      )}
    </Layout>
  );
}
