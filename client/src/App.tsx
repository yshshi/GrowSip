import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/main-layout";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import Plans from "@/pages/plans";
import Calculators from "@/pages/calculators";
import Portfolio from "@/pages/portfolio";
import Transactions from "@/pages/transactions";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPlans from "@/pages/admin/plans";
import AdminUsers from "@/pages/admin/users";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
        </>
      ) : (
        <MainLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/plans" component={Plans} />
          <Route path="/calculators" component={Calculators} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/plans" component={AdminPlans} />
          <Route path="/admin/users" component={AdminUsers} />
        </MainLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
