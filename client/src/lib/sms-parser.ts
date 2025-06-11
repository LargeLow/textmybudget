export interface ParsedSMSMessage {
  envelopeName: string;
  amount: number;
  type: "expense" | "savings";
}

export interface SMSParseResult {
  success: boolean;
  data?: ParsedSMSMessage;
  suggestion?: string;
}

export function parseSMSMessage(message: string): ParsedSMSMessage | null {
  const result = parseSMSMessageWithSuggestion(message);
  return result.success ? result.data! : null;
}

export function parseSMSMessageWithSuggestion(message: string): SMSParseResult {
  // Trim and normalize the message
  const normalizedMessage = message.trim();
  
  // Patterns to match:
  // "Groceries -$25.50" (expense)
  // "Vacation +$100" (savings)
  // "Groceries -25.50" (expense without $)
  // "Vacation +100" (savings without $)
  
  const expensePattern = /^(.+?)\s*-\$?(\d+(?:\.\d{2})?)$/i;
  const savingsPattern = /^(.+?)\s*\+\$?(\d+(?:\.\d{2})?)$/i;
  
  let match = normalizedMessage.match(expensePattern);
  if (match) {
    return {
      success: true,
      data: {
        envelopeName: match[1].trim(),
        amount: parseFloat(match[2]),
        type: "expense"
      }
    };
  }
  
  match = normalizedMessage.match(savingsPattern);
  if (match) {
    return {
      success: true,
      data: {
        envelopeName: match[1].trim(),
        amount: parseFloat(match[2]),
        type: "savings"
      }
    };
  }
  
  // Check if it looks like a transaction but missing + or -
  const missingSignPattern = /^(.+?)\s*\$?(\d+(?:\.\d{2})?)$/i;
  const missingSignMatch = normalizedMessage.match(missingSignPattern);
  
  if (missingSignMatch) {
    const envelopeName = missingSignMatch[1].trim();
    const amount = missingSignMatch[2];
    
    return {
      success: false,
      suggestion: `Did you want to add or deduct $${amount} from ${envelopeName}? Try "${envelopeName} +$${amount}" to add or "${envelopeName} -$${amount}" to deduct.`
    };
  }
  
  return { success: false };
}
