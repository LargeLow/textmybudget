import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send } from "lucide-react";

export default function SMSTest() {
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+15551234567");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/sms/webhook", {
        Body: message,
        From: phoneNumber
      });
      const result = await response.json();
      setResponse(result.message || JSON.stringify(result));
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const testCommands = [
    { label: "Login", command: "login" },
    { label: "Help", command: "help" },
    { label: "List Envelopes", command: "list" },
    { label: "Check Balance", command: "balance Groceries" },
    { label: "Add Expense", command: "Groceries -$15.50" },
    { label: "Add Savings", command: "Vacation Fund +$50" },
    { label: "Missing Sign (Test)", command: "Groceries 25.50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS Testing Interface</h1>
          <p className="text-gray-600">Test SMS commands without needing a real SMS service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SMS Simulator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                SMS Simulator
              </CardTitle>
              <CardDescription>
                Simulate SMS messages to test your budgeting commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendSMS} className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">From Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+15551234567"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the demo user's phone number to test
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">SMS Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your SMS command here..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                  disabled={isLoading || !message.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Sending..." : "Send SMS"}
                </Button>
              </form>

              {/* Quick Test Buttons */}
              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Quick Test Commands
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {testCommands.map((cmd) => (
                    <Button
                      key={cmd.command}
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage(cmd.command)}
                      disabled={isLoading}
                      className="justify-start text-left"
                    >
                      <span className="font-medium mr-2">{cmd.label}:</span>
                      <code className="text-xs bg-gray-100 px-1 rounded">{cmd.command}</code>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Display */}
          <Card>
            <CardHeader>
              <CardTitle>SMS Response</CardTitle>
              <CardDescription>
                The response your users would receive via SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                {response ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Response:</div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                        {response}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    Send an SMS command to see the response
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>SMS Integration Options</CardTitle>
            <CardDescription>
              For production use, you'll need to integrate with an SMS service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Twilio</h4>
                <p className="text-sm text-gray-600">
                  Most popular SMS API. Supports short codes, long codes, and toll-free numbers.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Easy webhook setup</li>
                  <li>• Global coverage</li>
                  <li>• $0.0075 per SMS</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">AWS SNS</h4>
                <p className="text-sm text-gray-600">
                  Amazon's SMS service with good integration into AWS ecosystem.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• AWS integration</li>
                  <li>• Competitive pricing</li>
                  <li>• $0.00645 per SMS</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Short Code</h4>
                <p className="text-sm text-gray-600">
                  5-6 digit numbers for high-volume messaging and better deliverability.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Higher throughput</li>
                  <li>• Better deliverability</li>
                  <li>• $500-1000/month</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Session-Based SMS Features:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Smart error recovery: Users can reply "add" or "subtract" when missing + or -</li>
                <li>• Session management: Pending transactions stored for 5 minutes</li>
                <li>• Enhanced user experience with contextual follow-up options</li>
                <li>• Example flow: "Groceries 25.50" → Reply "subtract" → Transaction completed</li>
              </ul>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Production Ready Features:</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Webhook endpoint `/api/sms/webhook` ready for Twilio/AWS SNS integration</li>
                <li>• Comprehensive command set: login, help, list, balance, transactions</li>
                <li>• Automatic session cleanup and error handling</li>
                <li>• Real-time balance updates and transaction processing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}