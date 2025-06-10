interface TransactionWithEnvelope {
  id: number;
  amount: string;
  createdAt: Date;
  envelopeName: string;
  envelopeIcon: string;
  envelopeType: string;
}

interface ActivityItemProps {
  transaction: TransactionWithEnvelope;
}

const iconMap: Record<string, string> = {
  "utensils": "🍽️",
  "cocktail": "🍹",
  "gas-pump": "⛽",
  "plane": "✈️",
  "shield-alt": "🛡️",
  "home": "🏠",
  "car": "🚗",
  "shopping-cart": "🛒",
  "gamepad": "🎮",
  "dumbbell": "💪",
  "wallet": "💰",
  "piggy-bank": "🐷"
};

export function ActivityItem({ transaction }: ActivityItemProps) {
  const amount = parseFloat(transaction.amount);
  const isPositive = amount > 0;
  const timestamp = new Date(transaction.createdAt);
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${
        transaction.envelopeType === "expense" ? "bg-red-50" : "bg-green-50"
      }`}>
        <span className="text-sm">
          {iconMap[transaction.envelopeIcon] || iconMap.wallet}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{transaction.envelopeName}</p>
        <p className="text-xs text-gray-500">{formatTimeAgo(timestamp)}</p>
      </div>
      <div className={`text-sm font-semibold ${
        isPositive ? "text-success-green" : "text-danger-red"
      }`}>
        {isPositive ? "+" : "-"}{formatCurrency(amount)}
      </div>
    </div>
  );
}
