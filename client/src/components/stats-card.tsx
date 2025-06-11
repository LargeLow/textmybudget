import { Wallet, ArrowDown, ArrowUp, PiggyBank } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: "wallet" | "arrow-down" | "arrow-up" | "piggy-bank";
  color: "blue" | "red" | "green" | "amber";
}

const iconComponents = {
  wallet: Wallet,
  "arrow-down": ArrowDown,
  "arrow-up": ArrowUp,
  "piggy-bank": PiggyBank,
};

const colorClasses = {
  blue: "p-2 bg-blue-50 rounded-lg text-brand-blue",
  red: "p-2 bg-red-50 rounded-lg text-danger-red",
  green: "p-2 bg-green-50 rounded-lg text-success-green",
  amber: "p-2 bg-amber-50 rounded-lg text-warning-amber",
};

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const IconComponent = iconComponents[icon];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={colorClasses[color]}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
