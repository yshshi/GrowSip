import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import KpiCards from "@/components/dashboard/kpi-cards";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import AllocationChart from "@/components/dashboard/allocation-chart";
import TransactionsTable from "@/components/dashboard/transactions-table";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/subscriptions"],
    retry: false,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
    retry: false,
  });

  if (isLoading || subscriptionsLoading || transactionsLoading || plansLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-8 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate portfolio metrics
  const totalInvested = subscriptions.reduce((sum: number, sub: any) => 
    sum + parseFloat(sub.amount || 0), 0
  );
  
  const successfulTransactions = transactions.filter((tx: any) => tx.status === 'SUCCESS');
  const totalTransactionAmount = successfulTransactions.reduce((sum: number, tx: any) => 
    sum + parseFloat(tx.amount || 0), 0
  );

  // Mock current value calculation (would be real-time in production)
  const currentValue = totalTransactionAmount * 1.125; // Assuming 12.5% growth
  const absoluteGain = currentValue - totalTransactionAmount;
  const xirr = totalTransactionAmount > 0 ? (absoluteGain / totalTransactionAmount) * 100 : 0;

  const portfolioData = {
    currentValue,
    investedAmount: totalTransactionAmount,
    absoluteGain,
    xirr,
    activeSips: subscriptions.filter((sub: any) => sub.status === 'active').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <KpiCards data={portfolioData} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioChart data={successfulTransactions} />
        <AllocationChart subscriptions={subscriptions} plans={plans} />
      </div>

      {/* Recent Transactions */}
      <TransactionsTable 
        transactions={transactions.slice(0, 10)} 
        plans={plans}
        showViewAll={true}
      />
    </div>
  );
}
