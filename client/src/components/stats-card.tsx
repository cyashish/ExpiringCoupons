interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  valueColor = "text-textPrimary" 
}: StatsCardProps) {
  return (
    <div className="bg-surface rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-textSecondary text-sm font-medium">{title}</p>
          <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
