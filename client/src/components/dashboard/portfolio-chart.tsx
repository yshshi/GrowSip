import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface PortfolioChartProps {
  data: any[];
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState("1Y");

  // Generate portfolio growth data based on transactions
  const generateChartData = () => {
    const chartData = [];
    let cumulativeValue = 0;
    
    // Sort transactions by date
    const sortedTransactions = [...data]
          .filter(tx => tx.status === 'SUCCESS')
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

    // Generate monthly data points
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = sortedTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === date.getFullYear() && 
               txDate.getMonth() === date.getMonth();
      });
      
      const monthlyInvestment = monthTransactions.reduce((sum, tx) => 
        sum + parseFloat(tx.amount || 0), 0
      );
      
      cumulativeValue += monthlyInvestment;
      
      // Apply growth (mock calculation - would be real market data in production)
      const growth = cumulativeValue * (1 + (Math.random() * 0.02 + 0.01));
      
      chartData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        invested: cumulativeValue,
        value: growth,
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();

  const timeRanges = [
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "1Y", value: "1Y", active: true },
    { label: "ALL", value: "ALL" },
  ];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Portfolio Growth
          </CardTitle>
          <div className="flex items-center space-x-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range.value)}
                className={timeRange === range.value 
                  ? "bg-primary-600 text-white text-xs px-2 py-1"
                  : "text-xs text-slate-500 hover:text-primary-600 px-2 py-1"
                }
                data-testid={`button-timerange-${range.value}`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(203.8863, 88.2845%, 53.1373%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(159.7826, 100%, 36.0784%)" stopOpacity={0.1}/>
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
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(203.8863, 88.2845%, 53.1373%)"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
