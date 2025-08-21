interface CategoryCardProps {
  name: string;
  count: number;
  merchants: string;
  icon: React.ReactNode;
  iconBgColor: string;
  onClick?: () => void;
}

export default function CategoryCard({ 
  name, 
  count, 
  merchants, 
  icon, 
  iconBgColor,
  onClick 
}: CategoryCardProps) {
  return (
    <div 
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <span className="font-medium text-textPrimary">{name}</span>
        </div>
        <span className="text-sm text-textSecondary">{count} coupons</span>
      </div>
      <div className="text-sm text-textSecondary">{merchants}</div>
    </div>
  );
}
