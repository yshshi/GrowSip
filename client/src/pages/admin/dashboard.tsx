import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { Users, DollarSign, TrendingUp, CheckCircle, Clock, UserCheck, Settings, Plus } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { CHART_COLORS } from "@/lib/constants";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
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

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ["/api/admin/audit"],
    retry: false,
  });

  if (isLoading || usersLoading || transactionsLoading || plansLoading || auditLoading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="border-red-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h3>
            <p className="text-slate-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate KPI metrics
  const totalAUM = transactions
    .filter((tx: any) => tx.status === 'SUCCESS')
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0) * 1.125; // Mock current value

  const activeSIPs = users.filter((user: any) => user.status === 'active').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const mtdInflows = transactions
    .filter((tx: any) => {
      const txDate = new Date(tx.createdAt);
      return tx.status === 'SUCCESS' && 
             txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);

  const approvalRate = users.length > 0 
    ? (users.filter((user: any) => user.kycStatus === 'approved').length / users.length) * 100 
    : 0;

  // Plan performance data
  const planPerformance = plans.map((plan: any) => {
    const planTransactions = transactions.filter((tx: any) => tx.planId === plan.id && tx.status === 'SUCCESS');
    const planAUM = planTransactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);
    
    return {
      name: plan.name,
      aum: planAUM,
      cagr: parseFloat(plan.cagr3y || 0),
      expectedReturn: parseFloat(plan.expectedReturnDefault || 0),
      transactions: planTransactions.length,
    };
  }).sort((a, b) => b.aum - a.aum);

  // Monthly inflow data (last 6 months)
  const generateInflowData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthlyTransactions = transactions.filter((tx: any) => {
        const txDate = new Date(tx.createdAt);
        return tx.status === 'SUCCESS' &&
               txDate.getMonth() === date.getMonth() &&
               txDate.getFullYear() === date.getFullYear();
      });
      
      const inflow = monthlyTransactions.reduce((sum: number, tx: any) => 
        sum + parseFloat(tx.amount || 0), 0
      );
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        inflow,
        transactions: monthlyTransactions.length,
      });
    }
    return data;
  };

  const inflowData = generateInflowData();

  // Recent admin actions from audit logs
  const recentActions = auditLogs.slice(0, 5).map((log: any) => {
    const actor = users.find((u: any) => u.id === log.actorId);
    return {
      ...log,
      actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown',
      timeAgo: Math.floor((new Date().getTime() - new Date(log.createdAt).getTime()) / (1000 * 60 * 60)),
    };
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE_KYC':
        return <UserCheck className="w-4 h-4 text-success-600" />;
      case 'CREATE_PLAN':
        return <Plus className="w-4 h-4 text-primary-600" />;
      case 'UPDATE_PLAN':
        return <Settings className="w-4 h-4 text-warning-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVE_KYC':
        return 'bg-success-100';
      case 'CREATE_PLAN':
        return 'bg-primary-100';
      case 'UPDATE_PLAN':
        return 'bg-warning-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <Badge className="bg-primary-50 text-primary-600">
                +8.2%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-total-aum">
              {formatNumber(totalAUM)}
            </h3>
            <p className="text-sm text-slate-500">Total AUM</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-success-600" />
              </div>
              <span className="text-sm font-medium text-success-600">Active</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-active-sips">
              {activeSIPs}
            </h3>
            <p className="text-sm text-slate-500">Active SIPs</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <span className="text-sm font-medium text-warning-600">MTD</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-mtd-inflows">
              {formatNumber(mtdInflows)}
            </h3>
            <p className="text-sm text-slate-500">Inflows</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-success-600">
                {approvalRate.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">KYC</h3>
            <p className="text-sm text-slate-500">Approval Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Inflows Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Monthly Inflows Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Inflow']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inflow" 
                    stroke={CHART_COLORS.PRIMARY}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.PRIMARY, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Performance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Top Plans by AUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planPerformance.slice(0, 5).map((plan, index) => (
                <div key={plan.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length] }}
                    />
                    <div>
                      <h4 className="font-medium text-slate-900" data-testid={`text-plan-name-${index}`}>
                        {plan.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {plan.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900" data-testid={`text-plan-aum-${index}`}>
                      {formatNumber(plan.aum)}
                    </div>
                    <div className="text-xs text-success-600">
                      {plan.expectedReturn}% expected
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Actions */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Recent Admin Actions
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-200 hover:bg-slate-50"
              data-testid="button-view-all-audit"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActions.length > 0 ? (
            <div className="space-y-4">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(action.action)}`}>
                    {getActionIcon(action.action)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900" data-testid={`text-action-description-${action.id}`}>
                      <span className="font-medium">{action.actorName}</span> 
                      {' '}
                      {action.action.toLowerCase().replace(/_/g, ' ')}
                      {' '}
                      {action.targetType} {action.targetId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {action.timeAgo} hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No recent admin actions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Create New Plan</h3>
            <p className="text-sm text-slate-600 mb-4">Add a new SIP investment plan</p>
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              data-testid="button-create-plan"
            >
              Create Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Review KYC</h3>
            <p className="text-sm text-slate-600 mb-4">Approve pending user verifications</p>
            <Button 
              variant="outline" 
              className="border-slate-200 hover:bg-slate-50"
              data-testid="button-review-kyc"
            >
              Review KYC
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">System Settings</h3>
            <p className="text-sm text-slate-600 mb-4">Configure platform settings</p>
            <Button 
              variant="outline" 
              className="border-slate-200 hover:bg-slate-50"
              data-testid="button-system-settings"
            >
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
