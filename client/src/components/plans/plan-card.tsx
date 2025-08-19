import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Info, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlanCardProps {
  plan: any;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-success-100 text-success-800";
      case "Medium":
        return "bg-warning-100 text-warning-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Very High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getRiskDots = (riskLevel: string) => {
    const levels = { "Low": 1, "Medium": 2, "High": 3, "Very High": 4 };
    const level = levels[riskLevel as keyof typeof levels] || 1;
    
    return (
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < level 
                ? level === 1 ? "bg-success-500"
                  : level === 2 ? "bg-warning-500"
                  : level === 3 ? "bg-orange-500"
                  : "bg-red-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const startSipMutation = useMutation({
    mutationFn: async () => {
      const subscriptionData = {
        planId: plan.id,
        amount: plan.minSipAmount,
        dayOfMonth: 15,
        startDate: new Date().toISOString(),
      };
      
      await apiRequest("POST", "/api/subscriptions", subscriptionData);
    },
    onSuccess: () => {
      toast({
        title: "SIP Started Successfully",
        description: `Your SIP for ${plan.name} has been activated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error) => {
      console.error("Failed to start SIP:", error);
      toast({
        title: "Failed to Start SIP",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Generate sparkline data (mock)
  const generateSparklineData = () => {
    const bars = [];
    const volatility = plan.riskLevel === "Very High" ? 20 : 
                     plan.riskLevel === "High" ? 15 :
                     plan.riskLevel === "Medium" ? 10 : 8;
    
    for (let i = 0; i < 10; i++) {
      const height = Math.random() * volatility + 5;
      bars.push(
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-primary-300 to-success-500 rounded-t"
          style={{ height: `${height * 2}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-6">
        {/* Plan Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1" data-testid={`text-plan-name-${plan.id}`}>
              {plan.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs" data-testid={`badge-plan-category-${plan.id}`}>
                {plan.category}
              </Badge>
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
              <div className="flex items-center space-x-1">
                {getRiskDots(plan.riskLevel)}
                <span className="text-xs text-slate-500">{plan.riskLevel} Risk</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'} hover:bg-slate-100`}
            onClick={() => setIsLiked(!isLiked)}
            data-testid={`button-like-plan-${plan.id}`}
          >
            <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
          </Button>
        </div>

        {/* Performance Metrics */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-2xl font-bold text-slate-900" data-testid={`text-plan-return-${plan.id}`}>
              {plan.expectedReturnDefault}%
            </span>
            <span className="text-sm text-slate-500">Expected Annual Return</span>
          </div>

          {/* Mini Chart (Sparkline) */}
          <div className="h-16 bg-gradient-to-br from-primary-50 to-success-50 rounded-lg flex items-end space-x-1 p-2">
            {generateSparklineData()}
          </div>
        </div>

        {/* Plan Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Min SIP Amount</span>
            <span className="font-medium text-slate-900" data-testid={`text-plan-min-sip-${plan.id}`}>
              {formatCurrency(plan.minSipAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Lock-in Period</span>
            <span className="font-medium text-slate-900" data-testid={`text-plan-lock-in-${plan.id}`}>
              {plan.lockInMonths} months
            </span>
          </div>
          {plan.cagr3y && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">3Y CAGR</span>
              <span className="font-medium text-success-600 flex items-center" data-testid={`text-plan-cagr-${plan.id}`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {plan.cagr3y}%
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            onClick={() => startSipMutation.mutate()}
            disabled={startSipMutation.isPending}
            data-testid={`button-start-sip-${plan.id}`}
          >
            {startSipMutation.isPending ? "Starting..." : "Start SIP"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-4 border-slate-200 hover:bg-slate-50"
            data-testid={`button-view-details-${plan.id}`}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
