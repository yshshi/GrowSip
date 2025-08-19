import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Coins, TrendingUp, Layers } from "lucide-react";

interface KpiCardsProps {
  data: {
    currentValue: number;
    investedAmount: number;
    absoluteGain: number;
    xirr: number;
    activeSips: number;
  };
}

export default function KpiCards({ data }: KpiCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const gainPercentage = data.investedAmount > 0 
    ? ((data.absoluteGain / data.investedAmount) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Value */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-success-600" />
            </div>
            <span className="text-sm font-medium text-success-600 bg-success-50 px-2 py-1 rounded-lg">
              +{gainPercentage}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-current-value">
            {formatCurrency(data.currentValue)}
          </h3>
          <p className="text-sm text-slate-500">Current Value</p>
          <div className="mt-3 flex items-center text-xs text-success-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>{formatCurrency(data.absoluteGain)} vs invested</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Invested */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-invested-amount">
            {formatCurrency(data.investedAmount)}
          </h3>
          <p className="text-sm text-slate-500">Total Invested</p>
          <div className="mt-3 flex items-center text-xs text-slate-600">
            <span>Across {data.activeSips} active SIPs</span>
          </div>
        </CardContent>
      </Card>

      {/* XIRR */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <span className="text-sm font-medium text-warning-600">XIRR</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-xirr">
            {data.xirr.toFixed(1)}%
          </h3>
          <p className="text-sm text-slate-500">Annualized Return</p>
          <div className="mt-3 flex items-center text-xs text-warning-600">
            <span>Above market average</span>
          </div>
        </CardContent>
      </Card>

      {/* Active SIPs */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-active-sips">
            {data.activeSips}
          </h3>
          <p className="text-sm text-slate-500">SIP Plans</p>
          <div className="mt-3 flex items-center text-xs text-slate-600">
            <span>Next: 15th this month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
