import { Progress } from "@/components/ui/progress";
import type { Envelope } from "@shared/schema";

interface EnvelopeCardProps {
  envelope: Envelope;
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

export function EnvelopeCard({ envelope }: EnvelopeCardProps) {
  const budget = parseFloat(envelope.budgetAmount);
  const current = parseFloat(envelope.currentAmount);
  
  let progress: number;
  let remaining: number;
  let progressColor: string;
  let isOverBudget = false;

  if (envelope.type === "expense") {
    // For expenses, current amount represents money spent
    remaining = budget - current;
    progress = budget > 0 ? (current / budget) * 100 : 0;
    isOverBudget = current > budget;
    
    if (isOverBudget) {
      progressColor = "bg-danger-red";
    } else if (progress > 75) {
      progressColor = "bg-warning-amber";
    } else {
      progressColor = "bg-success-green";
    }
  } else {
    // For savings, current amount represents money saved toward goal
    remaining = budget - current;
    progress = budget > 0 ? (current / budget) * 100 : 0;
    progressColor = "bg-success-green";
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${
            envelope.type === "expense" ? "bg-red-50" : "bg-green-50"
          }`}>
            <span className="text-lg">
              {iconMap[envelope.icon] || iconMap.wallet}
            </span>
          </div>
          <div className="ml-3">
            <h5 className="font-medium text-gray-900">{envelope.name}</h5>
            <p className="text-sm text-gray-500">
              {envelope.period.charAt(0).toUpperCase() + envelope.period.slice(1)} {
                envelope.type === "expense" ? "budget" : "goal"
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          {envelope.type === "expense" ? (
            <>
              <p className={`text-lg font-semibold ${
                isOverBudget ? "text-danger-red" : "text-gray-900"
              }`}>
                {formatCurrency(remaining)}
              </p>
              <p className="text-sm text-gray-500">
                of {formatCurrency(budget)} {isOverBudget ? "over" : "left"}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-success-green">
                {formatCurrency(current)}
              </p>
              <p className="text-sm text-gray-500">
                of {formatCurrency(budget)} saved
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        {envelope.type === "expense" ? (
          <>
            <span>Spent: {formatCurrency(current)}</span>
            <span className={isOverBudget ? "text-danger-red" : ""}>
              {Math.round(progress)}% used
            </span>
          </>
        ) : (
          <>
            <span>{Math.round(progress)}% complete</span>
            <span>{formatCurrency(remaining)} to go</span>
          </>
        )}
      </div>
    </div>
  );
}
