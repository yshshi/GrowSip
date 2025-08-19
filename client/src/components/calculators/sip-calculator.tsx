import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Download, Share, ArrowRight } from "lucide-react";
import { calculateSipFutureValue, formatCurrency } from "@/lib/calculations";
import { MIN_SIP_AMOUNT, MAX_SIP_AMOUNT, MIN_DURATION_YEARS, MAX_DURATION_YEARS, MIN_RETURN_RATE, MAX_RETURN_RATE } from "@/lib/constants";

export default function SipCalculator() {
  const [sipAmount, setSipAmount] = useState(5000);
  const [duration, setDuration] = useState(15);
  const [returnRate, setReturnRate] = useState(12);

  const { futureValue, totalInvestment, capitalGains } = calculateSipFutureValue(
    sipAmount,
    returnRate,
    duration
  );

  // Generate chart data for visualization
  const generateChartData = () => {
    const data = [];
    for (let year = 1; year <= duration; year++) {
      const yearResult = calculateSipFutureValue(sipAmount, returnRate, year);
      data.push({
        year,
        invested: yearResult.totalInvestment,
        value: yearResult.futureValue,
        gains: yearResult.capitalGains
      });
    }
    return data;
  };

  const chartData = generateChartData();

  // Generate yearly breakdown for display
  const generateYearlyBreakdown = () => {
    const milestones = [5, 10, 15, 20, 25, 30].filter(year => year <= duration);
    return milestones.map(year => {
      const result = calculateSipFutureValue(sipAmount, returnRate, year);
      return {
        year,
        value: result.futureValue
      };
    });
  };

  const yearlyBreakdown = generateYearlyBreakdown();

  const gainPercentage = totalInvestment > 0 ? ((capitalGains / totalInvestment) * 100).toFixed(1) : "0.0";

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">SIP Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Form */}
          <div className="space-y-6">
            
            {/* Monthly Investment */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Monthly Investment</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">₹</span>
                <Input
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="pl-8 pr-4 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  min={MIN_SIP_AMOUNT}
                  max={MAX_SIP_AMOUNT}
                  data-testid="input-sip-amount"
                />
              </div>
              <Slider
                value={[sipAmount]}
                onValueChange={([value]) => setSipAmount(value)}
                min={MIN_SIP_AMOUNT}
                max={MAX_SIP_AMOUNT}
                step={500}
                className="w-full"
                data-testid="slider-sip-amount"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>₹{MIN_SIP_AMOUNT.toLocaleString()}</span>
                <span>₹{MAX_SIP_AMOUNT.toLocaleString()}</span>
              </div>
            </div>

            {/* Investment Duration */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Investment Duration</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="pr-16 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  min={MIN_DURATION_YEARS}
                  max={MAX_DURATION_YEARS}
                  data-testid="input-duration"
                />
                <span className="absolute right-3 top-3 text-slate-500">years</span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={MIN_DURATION_YEARS}
                max={MAX_DURATION_YEARS}
                step={1}
                className="w-full"
                data-testid="slider-duration"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{MIN_DURATION_YEARS} year</span>
                <span>{MAX_DURATION_YEARS} years</span>
              </div>
            </div>

            {/* Expected Annual Return */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Expected Annual Return</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="pr-12 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  min={MIN_RETURN_RATE}
                  max={MAX_RETURN_RATE}
                  step={0.1}
                  data-testid="input-return-rate"
                />
                <span className="absolute right-3 top-3 text-slate-500">%</span>
              </div>
              <Slider
                value={[returnRate]}
                onValueChange={([value]) => setReturnRate(value)}
                min={MIN_RETURN_RATE}
                max={MAX_RETURN_RATE}
                step={0.1}
                className="w-full"
                data-testid="slider-return-rate"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{MIN_RETURN_RATE}%</span>
                <span>{MAX_RETURN_RATE}%</span>
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-success-50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Investment</span>
                <span className="text-lg font-bold text-slate-900" data-testid="text-total-investment">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Future Value</span>
                <span className="text-2xl font-bold text-success-600" data-testid="text-future-value">
                  {formatCurrency(futureValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Capital Gains</span>
                <span className="text-lg font-bold text-primary-600" data-testid="text-capital-gains">
                  {formatCurrency(capitalGains)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/50 pt-3">
                <span className="text-sm text-slate-600">Gain Percentage</span>
                <span className="text-sm font-bold text-success-600">
                  +{gainPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart Visualization */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-slate-900">Growth Projection</h4>
            
            {/* Chart */}
            <div className="h-80 bg-gradient-to-br from-primary-50 to-success-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(203.8863, 88.2845%, 53.1373%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(203.8863, 88.2845%, 53.1373%)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(159.7826, 100%, 36.0784%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(159.7826, 100%, 36.0784%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'invested' ? 'Total Invested' : 'Future Value'
                    ]}
                    labelFormatter={(year) => `Year ${year}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stackId="1"
                    stroke="hsl(203.8863, 88.2845%, 53.1373%)"
                    fill="url(#colorInvested)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gains"
                    stackId="1"
                    stroke="hsl(159.7826, 100%, 36.0784%)"
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Table */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h5 className="font-medium text-slate-900 mb-3">Milestone Breakdown</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {yearlyBreakdown.map((milestone) => (
                  <div key={milestone.year} className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">Year {milestone.year}</span>
                    <span className="font-medium text-slate-900" data-testid={`text-milestone-year-${milestone.year}`}>
                      {formatCurrency(milestone.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 pt-6 mt-8">
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-primary-600 hover:bg-primary-700 text-white"
              data-testid="button-apply-to-plan"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Apply to Plan
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-200 hover:bg-slate-50"
              data-testid="button-download-report"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button 
              variant="outline"
              className="border-slate-200 hover:bg-slate-50"
              data-testid="button-share-calculation"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
