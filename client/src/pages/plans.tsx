import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PlanFilters from "@/components/plans/plan-filters";
import PlanCard from "@/components/plans/plan-card";

export default function Plans() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [riskFilter, setRiskFilter] = useState("Risk Level");
  const [sortBy, setSortBy] = useState("Sort by Return");

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

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
    retry: false,
  });

  // Filter and sort plans
  const filteredPlans = plans
    .filter((plan: any) => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All Categories" || plan.category === categoryFilter;
      const matchesRisk = riskFilter === "Risk Level" || plan.riskLevel === riskFilter;
      return matchesSearch && matchesCategory && matchesRisk;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "Highest Return":
          return parseFloat(b.expectedReturnDefault) - parseFloat(a.expectedReturnDefault);
        case "Lowest Risk":
          const riskOrder = { "Low": 1, "Medium": 2, "High": 3, "Very High": 4 };
          return riskOrder[a.riskLevel as keyof typeof riskOrder] - riskOrder[b.riskLevel as keyof typeof riskOrder];
        case "Min Investment":
          return parseFloat(a.minSipAmount) - parseFloat(b.minSipAmount);
        default:
          return parseFloat(b.expectedReturnDefault) - parseFloat(a.expectedReturnDefault);
      }
    });

  if (isLoading || plansLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded"></div>
                <div className="h-16 bg-slate-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <PlanFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan: any) => (
            <PlanCard key={plan.id} plan={plan} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500" data-testid="text-no-plans">
              No plans found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
