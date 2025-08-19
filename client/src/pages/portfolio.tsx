import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { CHART_COLORS } from "@/lib/constants";

export default function Portfolio() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  // Calculate portfolio metrics
  const successfulTransactions = transactions.filter((tx: any) => tx.status === 'SUCCESS');
  const totalInvested = successfulTransactions.reduce((sum: number, tx: any) => 
    sum + parseFloat(tx.amount || 0), 0
  );

  const currentValue = totalInvested * 1.125; // Mock 12.5% growth
  const absoluteGain = currentValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

  // Generate portfolio allocation data
  const allocationData = subscriptions.reduce((acc: any, sub: any) => {
    const plan = plans.find((p: any) => p.id === sub.planId);
    if (!plan) return acc;
    
    const category = plan.category;
    const amount = parseFloat(sub.amount || 0);
    
    const existing = acc.find((item: any) => item.category === category);
    if (existing) {
      existing.amount += amount;
    } else {
      acc.push({ category, amount });
    }
    
    return acc;
  }, []);

  const totalAllocation = allocationData.reduce((sum: number, item: any) => sum + item.amount, 0);
  const chartData = allocationData.map((item: any, index: number) => ({
    ...item,
    percentage: totalAllocation > 0 ? ((item.amount / totalAllocation) * 100).toFixed(1) : 0,
    color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length],
  }));

  // Generate portfolio growth data
  const generateGrowthData = () => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Mock growth calculation based on transactions up to that point
      const monthTransactions = successfulTransactions.filter((tx: any) => 
        new Date(tx.createdAt) <= date
      );
      
      const monthlyInvested = monthTransactions.reduce((sum: number, tx: any) => 
        sum + parseFloat(tx.amount || 0), 0
      );
      
      const monthlyValue = monthlyInvested * (1 + (Math.random() * 0.05 + 0.10)); // 10-15% growth
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        invested: monthlyInvested,
        value: monthlyValue,
      });
    }
    return data;
  };

  const growthData = generateGrowthData();

  const getPlanName = (planId: string) => {
    const plan = plans.find((p: any) => p.id === planId);
    return plan?.name || 'Unknown Plan';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="w-4 h-4 text-success-600" />;
      case 'paused':
        return <PauseCircle className="w-4 h-4 text-warning-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'paused':
        return 'bg-warning-100 text-warning-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex items-center space-x-1">
                {gainPercentage >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${gainPercentage >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-portfolio-current-value">
              {formatNumber(currentValue)}
            </h3>
            <p className="text-sm text-slate-500">Current Portfolio Value</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-success-600" />
              </div>
              <span className="text-sm font-medium text-slate-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-portfolio-invested">
              {formatNumber(totalInvested)}
            </h3>
            <p className="text-sm text-slate-500">Total Invested</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <span className="text-sm font-medium text-warning-600">Gains</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-portfolio-gains">
              {formatNumber(absoluteGain)}
            </h3>
            <p className="text-sm text-slate-500">Absolute Gains</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Growth Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Portfolio Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.PRIMARY} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.SUCCESS} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
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
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'invested' ? 'Invested' : 'Portfolio Value'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.PRIMARY}
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="amount"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900" data-testid="text-active-plans-count">
                      {subscriptions.filter((sub: any) => sub.status === 'active').length}
                    </div>
                    <div className="text-xs text-slate-500">Active Plans</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {chartData.length > 0 ? (
                chartData.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900" data-testid={`text-allocation-${item.category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No active investments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active SIPs */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Active SIP Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((subscription: any) => (
                <div key={subscription.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-slate-900" data-testid={`text-subscription-plan-${subscription.id}`}>
                          {getPlanName(subscription.planId)}
                        </h4>
                        <Badge className={getStatusColor(subscription.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(subscription.status)}
                            <span className="capitalize">{subscription.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Monthly Amount</span>
                          <p className="font-medium text-slate-900" data-testid={`text-subscription-amount-${subscription.id}`}>
                            {formatCurrency(parseFloat(subscription.amount))}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">SIP Date</span>
                          <p className="font-medium text-slate-900">
                            {subscription.dayOfMonth}{subscription.dayOfMonth === 1 ? 'st' : 
                             subscription.dayOfMonth === 2 ? 'nd' : 
                             subscription.dayOfMonth === 3 ? 'rd' : 'th'} of every month
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Start Date</span>
                          <p className="font-medium text-slate-900">
                            {new Date(subscription.startDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Duration</span>
                          <p className="font-medium text-slate-900">
                            {Math.floor((new Date().getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {subscription.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-warning-200 text-warning-700 hover:bg-warning-50"
                          data-testid={`button-pause-subscription-${subscription.id}`}
                        >
                          <PauseCircle className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      ) : subscription.status === 'paused' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-success-200 text-success-700 hover:bg-success-50"
                          data-testid={`button-resume-subscription-${subscription.id}`}
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      ) : null}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-slate-200 hover:bg-slate-50"
                        data-testid={`button-modify-subscription-${subscription.id}`}
                      >
                        Modify
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-subscriptions">
                No active SIP subscriptions
              </p>
              <Button className="mt-4 bg-primary-600 hover:bg-primary-700">
                Start Your First SIP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
