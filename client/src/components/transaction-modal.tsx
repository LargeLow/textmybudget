import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Envelope, Transaction } from "@shared/schema";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  envelopes: Envelope[];
  transaction?: Transaction;
  mode: "create" | "edit";
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  envelopes,
  transaction,
  mode 
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    envelopeId: "",
    amount: "",
    description: "",
    source: "web"
  });

  useEffect(() => {
    if (mode === "edit" && transaction) {
      setFormData({
        envelopeId: transaction.envelopeId.toString(),
        amount: Math.abs(parseFloat(transaction.amount)).toString(),
        description: transaction.description || "",
        source: transaction.source
      });
    } else {
      setFormData({
        envelopeId: "",
        amount: "",
        description: "",
        source: "web"
      });
    }
  }, [mode, transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const envelope = envelopes.find(e => e.id === parseInt(formData.envelopeId));
    if (!envelope) return;

    const amount = parseFloat(formData.amount);
    const transactionAmount = envelope.type === "expense" ? -Math.abs(amount) : Math.abs(amount);

    onSubmit({
      ...formData,
      envelopeId: parseInt(formData.envelopeId),
      amount: transactionAmount,
      ...(mode === "edit" && { id: transaction?.id })
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedEnvelope = envelopes.find(e => e.id === parseInt(formData.envelopeId));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Transaction" : "Edit Transaction"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="envelopeId">Envelope</Label>
            <Select 
              value={formData.envelopeId} 
              onValueChange={(value) => handleInputChange("envelopeId", value)}
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an envelope" />
              </SelectTrigger>
              <SelectContent>
                {envelopes.map((envelope) => (
                  <SelectItem key={envelope.id} value={envelope.id.toString()}>
                    {envelope.name} ({envelope.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount">
              Amount {selectedEnvelope && `(${selectedEnvelope.type === "expense" ? "Expense" : "Savings"})`}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
            {selectedEnvelope && (
              <p className="text-xs text-gray-600 mt-1">
                This will be {selectedEnvelope.type === "expense" ? "subtracted from" : "added to"} your {selectedEnvelope.name} envelope
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="What was this transaction for?"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90" 
              disabled={isLoading || !formData.envelopeId || !formData.amount}
            >
              {isLoading ? (mode === "create" ? "Adding..." : "Saving...") : (mode === "create" ? "Add Transaction" : "Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}