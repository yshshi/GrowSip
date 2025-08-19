import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AllocationChartProps {
  subscriptions: any[];
  plans: any[];
}

export default function AllocationChart({ subscriptions, plans }: AllocationChartProps) {
  // Calculate allocation data
  const allocationData = subscriptions.reduce((acc: any, sub: any) => {
    const plan = plans.find(p => p.id === sub.planId);
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

  const totalAmount = allocationData.reduce((sum: number, item: any) => sum + item.amount, 0);
  
  // Calculate percentages and assign colors
  const chartData = allocationData.map((item: any, index: number) => ({
    ...item,
    percentage: totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0,
    color: [
      "hsl(203.8863, 88.2845%, 53.1373%)", // primary
      "hsl(159.7826, 100%, 36.0784%)",      // success
      "hsl(42.0290, 92.8251%, 56.2745%)",   // warning
      "hsl(341.4894, 75.2000%, 50.9804%)",  // chart-5
    ][index % 4],
  }));

  const activePlansCount = subscriptions.filter(sub => sub.status === 'active').length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Donut Chart */}
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
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900" data-testid="text-plans-count">
                  {activePlansCount}
                </div>
                <div className="text-xs text-slate-500">Plans</div>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation List */}
        <div className="space-y-3">
          {chartData.length > 0 ? (
            chartData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
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
              <p className="text-slate-500">No active subscriptions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
