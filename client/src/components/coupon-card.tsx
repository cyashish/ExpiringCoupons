import { Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface CouponCardProps {
  coupon: {
    id: string;
    code: string;
    merchant: string;
    category: string;
    value: string;
    description?: string;
    expiryDate: Date;
    isActive: boolean;
    minimumAmount?: string;
    usageInstructions?: string;
  };
  onView?: () => void;
  onDelete?: () => void;
}

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

const getExpiryStatus = (expiryDate: Date) => {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 0) {
    return { status: "Expired", color: "bg-red-100 text-red-800" };
  } else if (daysUntilExpiry <= 7) {
    return { status: "Expiring Soon", color: "bg-red-100 text-red-800" };
  } else {
    return { status: "Active", color: "bg-green-100 text-green-800" };
  }
};

export default function CouponCard({ coupon, onView, onDelete }: CouponCardProps) {
  const categoryIcon = getCategoryIcon(coupon.category);
  const categoryColor = getCategoryColor(coupon.category);
  const expiryStatus = getExpiryStatus(new Date(coupon.expiryDate));

  return (
    <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{categoryIcon}</div>
          <div>
            <h3 className="font-semibold text-textPrimary">{coupon.code}</h3>
            <p className="text-sm text-textSecondary">{coupon.merchant}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
          {coupon.category}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-textPrimary font-medium">{coupon.value}</p>
        {coupon.description && (
          <p className="text-sm text-textSecondary mt-1">{coupon.description}</p>
        )}
        {coupon.minimumAmount && (
          <p className="text-xs text-textSecondary mt-1">Min. order: {coupon.minimumAmount}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-textSecondary">
          <Calendar size={14} />
          <span>Expires {format(new Date(coupon.expiryDate), 'MMM dd, yyyy')}</span>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.color}`}>
          {expiryStatus.status}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onView}
          className="flex items-center space-x-1 text-primary hover:text-blue-700 text-sm font-medium"
        >
          <ExternalLink size={14} />
          <span>View Details</span>
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
