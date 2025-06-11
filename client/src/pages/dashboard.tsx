import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Plus } from "lucide-react";
import { useState } from "react";
import { EnvelopeModal } from "@/components/envelope-modal";
import { EnvelopeCard } from "@/components/envelope-card";
import { StatsCard } from "@/components/stats-card";
import { ActivityItem } from "@/components/activity-item";
import { TransactionsList } from "@/components/transactions-list";
import type { Envelope, Transaction } from "@shared/schema";

interface UserStats {
  totalBudget: number;
  totalSpent: number;
  totalSaved: number;
  remaining: number;
}

interface TransactionWithEnvelope extends Transaction {
  envelopeName: string;
  envelopeIcon: string;
  envelopeType: string;
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = 1; // Demo user

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: [`/api/user/${userId}`],
  });

  // Fetch envelopes
  const { data: envelopes = [], isLoading: envelopesLoading } = useQuery<Envelope[]>({
    queryKey: [`/api/envelopes/${userId}`],
  });

  // Fetch stats
  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/stats/${userId}`],
  });

  // Fetch recent transactions
  const { data: recentTransactions = [] } = useQuery<TransactionWithEnvelope[]>({
    queryKey: [`/api/transactions/${userId}`, { limit: 5 }],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${userId}?limit=5`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  // Fetch all transactions
  const { data: allTransactions = [] } = useQuery<TransactionWithEnvelope[]>({
    queryKey: [`/api/transactions/${userId}`],
  });

  // Create envelope mutation
  const createEnvelopeMutation = useMutation({
    mutationFn: async (envelopeData: any) => {
      return apiRequest("POST", `/api/envelopes/${userId}`, envelopeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/envelopes/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/${userId}`] });
      setIsModalOpen(false);
    },
  });

  // Transaction mutations
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return apiRequest("POST", `/api/transactions/${userId}`, transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/envelopes/${userId}`] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return apiRequest("PUT", `/api/transactions/${transactionData.id}`, transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/envelopes/${userId}`] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("DELETE", `/api/transactions/${transactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/envelopes/${userId}`] });
    },
  });

  const expenseEnvelopes = envelopes.filter(e => e.type === "expense");
  const savingsEnvelopes = envelopes.filter(e => e.type === "savings");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-brand-blue">TextMyBudget</h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="/" className="text-gray-900 hover:text-brand-blue px-3 py-2 text-sm font-medium">Dashboard</a>
                <a href="/sms-test" className="text-gray-500 hover:text-brand-blue px-3 py-2 text-sm font-medium">SMS Test</a>
                <a href="#" className="text-gray-500 hover:text-brand-blue px-3 py-2 text-sm font-medium">History</a>
                <a href="#" className="text-gray-500 hover:text-brand-blue px-3 py-2 text-sm font-medium">Settings</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="h-8 w-8 bg-brand-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-brand-blue to-blue-700 rounded-xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Welcome to TextMyBudget</h2>
                <p className="text-blue-100">Text your expenses and track your budget effortlessly</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-sm text-blue-100 mb-1">Your SMS Number</div>
                <div className="text-xl font-bold">{user?.smsNumber || "+1 (555) 123-4567"}</div>
                <div className="text-xs text-blue-200 mt-1">Text format: "Groceries -$25.50"</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Budget"
            value={formatCurrency(stats?.totalBudget || 0)}
            icon="wallet"
            color="blue"
          />
          <StatsCard
            title="Spent This Month"
            value={formatCurrency(stats?.totalSpent || 0)}
            icon="arrow-down"
            color="red"
          />
          <StatsCard
            title="Saved This Month"
            value={formatCurrency(stats?.totalSaved || 0)}
            icon="arrow-up"
            color="green"
          />
          <StatsCard
            title="Remaining"
            value={formatCurrency(stats?.remaining || 0)}
            icon="piggy-bank"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Envelopes Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Budget Envelopes</h3>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Envelope
              </Button>
            </div>

            {/* Expense Envelopes */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="inline-block w-2 h-2 bg-danger-red rounded-full mr-2"></span>
                Expense Envelopes
              </h4>
              <div className="space-y-4">
                {envelopesLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading envelopes...</div>
                ) : expenseEnvelopes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No expense envelopes yet. Create your first one!
                  </div>
                ) : (
                  expenseEnvelopes.map((envelope) => (
                    <EnvelopeCard key={envelope.id} envelope={envelope} />
                  ))
                )}
              </div>
            </div>

            {/* Savings Envelopes */}
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <span className="inline-block w-2 h-2 bg-success-green rounded-full mr-2"></span>
                Savings Goals
              </h4>
              <div className="space-y-4">
                {savingsEnvelopes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No savings goals yet. Start saving today!
                  </div>
                ) : (
                  savingsEnvelopes.map((envelope) => (
                    <EnvelopeCard key={envelope.id} envelope={envelope} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Transactions Management */}
          <div>
            <TransactionsList
              transactions={allTransactions}
              envelopes={envelopes}
              onCreateTransaction={createTransactionMutation.mutate}
              onUpdateTransaction={updateTransactionMutation.mutate}
              onDeleteTransaction={deleteTransactionMutation.mutate}
              isLoading={createTransactionMutation.isPending || updateTransactionMutation.isPending || deleteTransactionMutation.isPending}
            />
            
            {/* SMS Guide */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-2 bg-brand-blue rounded-full mr-2"></span>
                SMS Commands
              </h4>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Record Expense</p>
                  <p className="text-xs text-gray-600 font-mono">"Groceries -$25.50"</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Add to Savings</p>
                  <p className="text-xs text-gray-600 font-mono">"Vacation +$100"</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">Check Balance</p>
                  <p className="text-xs text-gray-600 font-mono">"Balance Groceries"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Envelope Modal */}
      <EnvelopeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createEnvelopeMutation.mutate}
        isLoading={createEnvelopeMutation.isPending}
      />
    </div>
  );
}
