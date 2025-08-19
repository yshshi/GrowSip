import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SipCalculator from "@/components/calculators/sip-calculator";

type CalculatorType = "sip" | "stepup" | "goalbase" | "comparison" | "xirr";

export default function Calculators() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("sip");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const calculators = [
    { id: "sip", label: "SIP Calculator", active: true },
    { id: "stepup", label: "Step-up SIP" },
    { id: "goalbase", label: "Goal-based" },
    { id: "comparison", label: "Lumpsum vs SIP" },
    { id: "xirr", label: "XIRR Calculator" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Calculator Navigation */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            {calculators.map((calc) => (
              <Button
                key={calc.id}
                variant={activeCalculator === calc.id ? "default" : "ghost"}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeCalculator === calc.id
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setActiveCalculator(calc.id as CalculatorType)}
                data-testid={`button-calculator-${calc.id}`}
              >
                {calc.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculator Content */}
      {activeCalculator === "sip" && <SipCalculator />}
      
      {activeCalculator === "stepup" && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Step-up SIP Calculator</h3>
            <p className="text-slate-600">Coming Soon - Calculate the impact of annually increasing your SIP amount</p>
          </CardContent>
        </Card>
      )}

      {activeCalculator === "goalbase" && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Goal-based Calculator</h3>
            <p className="text-slate-600">Coming Soon - Calculate required SIP for your financial goals</p>
          </CardContent>
        </Card>
      )}

      {activeCalculator === "comparison" && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Lumpsum vs SIP</h3>
            <p className="text-slate-600">Coming Soon - Compare lumpsum investment vs systematic investment</p>
          </CardContent>
        </Card>
      )}

      {activeCalculator === "xirr" && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">XIRR Calculator</h3>
            <p className="text-slate-600">Coming Soon - Calculate extended internal rate of return</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
