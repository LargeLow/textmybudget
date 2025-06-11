import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { TransactionModal } from "./transaction-modal";
import type { Transaction, Envelope } from "@shared/schema";

interface TransactionWithEnvelope extends Transaction {
  envelopeName: string;
  envelopeIcon: string;
  envelopeType: string;
}

interface TransactionsListProps {
  transactions: TransactionWithEnvelope[];
  envelopes: Envelope[];
  onCreateTransaction: (data: any) => void;
  onUpdateTransaction: (data: any) => void;
  onDeleteTransaction: (id: number) => void;
  isLoading: boolean;
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

export function TransactionsList({ 
  transactions, 
  envelopes, 
  onCreateTransaction, 
  onUpdateTransaction, 
  onDeleteTransaction,
  isLoading 
}: TransactionsListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateTransaction = () => {
    setModalMode("create");
    setEditingTransaction(undefined);
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setModalMode("edit");
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleModalSubmit = (data: any) => {
    if (modalMode === "create") {
      onCreateTransaction(data);
    } else {
      onUpdateTransaction(data);
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
          All Transactions
        </h4>
        <Button 
          onClick={handleCreateTransaction}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No transactions yet. Add your first transaction!
          </div>
        ) : (
          transactions.map((transaction) => {
            const amount = parseFloat(transaction.amount);
            const isPositive = amount > 0;

            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                    <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                    {transaction.description && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{transaction.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`text-sm font-semibold ${
                    isPositive ? "text-success-green" : "text-danger-red"
                  }`}>
                    {isPositive ? "+" : "-"}{formatCurrency(amount)}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransaction(transaction)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={isLoading}
        envelopes={envelopes}
        transaction={editingTransaction}
        mode={modalMode}
      />
    </div>
  );
}