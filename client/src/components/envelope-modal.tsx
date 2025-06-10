import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface EnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const iconOptions = [
  { value: "utensils", label: "🍽️ Food" },
  { value: "cocktail", label: "🍹 Dining Out" },
  { value: "gas-pump", label: "⛽ Gas" },
  { value: "plane", label: "✈️ Travel" },
  { value: "shield-alt", label: "🛡️ Emergency" },
  { value: "home", label: "🏠 Home" },
  { value: "car", label: "🚗 Transportation" },
  { value: "shopping-cart", label: "🛒 Shopping" },
  { value: "gamepad", label: "🎮 Entertainment" },
  { value: "dumbbell", label: "💪 Fitness" },
];

export function EnvelopeModal({ isOpen, onClose, onSubmit, isLoading }: EnvelopeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    budgetAmount: "",
    period: "monthly",
    icon: "wallet"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      budgetAmount: parseFloat(formData.budgetAmount)
    });
    setFormData({
      name: "",
      type: "expense",
      budgetAmount: "",
      period: "monthly",
      icon: "wallet"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Envelope</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Envelope Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense Envelope</SelectItem>
                <SelectItem value="savings">Savings Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="name">Envelope Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Groceries, Vacation Fund"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="budgetAmount">
              {formData.type === "expense" ? "Budget Amount" : "Goal Amount"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                id="budgetAmount"
                type="number"
                step="0.01"
                value={formData.budgetAmount}
                onChange={(e) => handleInputChange("budgetAmount", e.target.value)}
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="period">Budget Period</Label>
            <Select value={formData.period} onValueChange={(value) => handleInputChange("period", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select value={formData.icon} onValueChange={(value) => handleInputChange("icon", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90" 
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Envelope"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
