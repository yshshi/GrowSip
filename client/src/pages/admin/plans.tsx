import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, Edit, Pause, Trash2, TrendingUp, DollarSign, Users, Search, Eye, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { PLAN_CATEGORIES, RISK_LEVELS, CHART_COLORS } from "@/lib/constants";

interface PlanFormData {
  name: string;
  category: string;
  riskLevel: string;
  minSipAmount: string;
  lockInMonths: string;
  expectedReturnDefault: string;
  expectedReturnMin: string;
  expectedReturnMax: string;
  description: string;
  tags: string;
  cagr3y: string;
}

const initialFormData: PlanFormData = {
  name: "",
  category: "",
  riskLevel: "",
  minSipAmount: "",
  lockInMonths: "",
  expectedReturnDefault: "",
  expectedReturnMin: "",
  expectedReturnMax: "",
  description: "",
  tags: "",
  cagr3y: "",
};

export default function AdminPlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);

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

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
    retry: false,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      await apiRequest("POST", "/api/plans", {
        ...planData,
        tags: planData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        minSipAmount: parseFloat(planData.minSipAmount),
        lockInMonths: parseInt(planData.lockInMonths),
        expectedReturnDefault: parseFloat(planData.expectedReturnDefault),
        expectedReturnMin: parseFloat(planData.expectedReturnMin),
        expectedReturnMax: parseFloat(planData.expectedReturnMax),
        cagr3y: planData.cagr3y ? parseFloat(planData.cagr3y) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan Created",
        description: "New SIP plan has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error) => {
      console.error("Failed to create plan:", error);
      toast({
        title: "Failed to Create Plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, planData }: { planId: string; planData: any }) => {
      await apiRequest("PATCH", `/api/plans/${planId}`, {
        ...planData,
        tags: planData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        minSipAmount: parseFloat(planData.minSipAmount),
        lockInMonths: parseInt(planData.lockInMonths),
        expectedReturnDefault: parseFloat(planData.expectedReturnDefault),
        expectedReturnMin: parseFloat(planData.expectedReturnMin),
        expectedReturnMax: parseFloat(planData.expectedReturnMax),
        cagr3y: planData.cagr3y ? parseFloat(planData.cagr3y) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan Updated",
        description: "Plan has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      setFormData(initialFormData);
    },
    onError: (error) => {
      console.error("Failed to update plan:", error);
      toast({
        title: "Failed to Update Plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest("DELETE", `/api/plans/${planId}`);
    },
    onSuccess: () => {
      toast({
        title: "Plan Deleted",
        description: "Plan has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
    },
    onError: (error) => {
      console.error("Failed to delete plan:", error);
      toast({
        title: "Failed to Delete Plan",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || plansLoading || transactionsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
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

  // Filter plans
  const filteredPlans = plans.filter((plan: any) => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || plan.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate plan analytics
  const calculatePlanMetrics = (planId: string) => {
    const planTransactions = transactions.filter((tx: any) => 
      tx.planId === planId && tx.status === 'SUCCESS'
    );
    const aum = planTransactions.reduce((sum: number, tx: any) => 
      sum + parseFloat(tx.amount || 0), 0
    );
    return {
      aum,
      transactionCount: planTransactions.length,
    };
  };

  // Plan performance chart data
  const planPerformanceData = filteredPlans.map((plan: any) => {
    const metrics = calculatePlanMetrics(plan.id);
    return {
      name: plan.name.length > 15 ? plan.name.substring(0, 15) + '...' : plan.name,
      aum: metrics.aum,
      expectedReturn: parseFloat(plan.expectedReturnDefault || 0),
      transactions: metrics.transactionCount,
    };
  }).sort((a, b) => b.aum - a.aum).slice(0, 6);

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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-success-100 text-success-800"
      : "bg-slate-100 text-slate-800";
  };

  const handleFormChange = (field: keyof PlanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreatePlan = () => {
    createPlanMutation.mutate(formData);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      category: plan.category,
      riskLevel: plan.riskLevel,
      minSipAmount: plan.minSipAmount,
      lockInMonths: plan.lockInMonths.toString(),
      expectedReturnDefault: plan.expectedReturnDefault,
      expectedReturnMin: plan.expectedReturnMin,
      expectedReturnMax: plan.expectedReturnMax,
      description: plan.description || "",
      tags: Array.isArray(plan.tags) ? plan.tags.join(', ') : "",
      cagr3y: plan.cagr3y || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({
        planId: editingPlan.id,
        planData: formData,
      });
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      deletePlanMutation.mutate(planId);
    }
  };

  // Summary calculations
  const totalPlans = plans.length;
  const activePlans = plans.filter((p: any) => p.isActive).length;
  const totalAUM = plans.reduce((sum: number, plan: any) => {
    const metrics = calculatePlanMetrics(plan.id);
    return sum + metrics.aum;
  }, 0);
  const avgReturn = plans.length > 0 
    ? plans.reduce((sum: number, p: any) => sum + parseFloat(p.expectedReturnDefault || 0), 0) / plans.length
    : 0;

  const PlanForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="Enter plan name"
            data-testid="input-plan-name"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
            <SelectTrigger data-testid="select-plan-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PLAN_CATEGORIES).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="riskLevel">Risk Level</Label>
          <Select value={formData.riskLevel} onValueChange={(value) => handleFormChange('riskLevel', value)}>
            <SelectTrigger data-testid="select-plan-risk">
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RISK_LEVELS).map((risk) => (
                <SelectItem key={risk} value={risk}>{risk}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="minSipAmount">Min SIP Amount (₹)</Label>
          <Input
            id="minSipAmount"
            type="number"
            value={formData.minSipAmount}
            onChange={(e) => handleFormChange('minSipAmount', e.target.value)}
            placeholder="1000"
            data-testid="input-min-sip-amount"
          />
        </div>
        <div>
          <Label htmlFor="lockInMonths">Lock-in Period (Months)</Label>
          <Input
            id="lockInMonths"
            type="number"
            value={formData.lockInMonths}
            onChange={(e) => handleFormChange('lockInMonths', e.target.value)}
            placeholder="36"
            data-testid="input-lock-in-months"
          />
        </div>
        <div>
          <Label htmlFor="expectedReturnDefault">Expected Return (%)</Label>
          <Input
            id="expectedReturnDefault"
            type="number"
            step="0.1"
            value={formData.expectedReturnDefault}
            onChange={(e) => handleFormChange('expectedReturnDefault', e.target.value)}
            placeholder="12.0"
            data-testid="input-expected-return"
          />
        </div>
        <div>
          <Label htmlFor="expectedReturnMin">Min Return (%)</Label>
          <Input
            id="expectedReturnMin"
            type="number"
            step="0.1"
            value={formData.expectedReturnMin}
            onChange={(e) => handleFormChange('expectedReturnMin', e.target.value)}
            placeholder="8.0"
            data-testid="input-min-return"
          />
        </div>
        <div>
          <Label htmlFor="expectedReturnMax">Max Return (%)</Label>
          <Input
            id="expectedReturnMax"
            type="number"
            step="0.1"
            value={formData.expectedReturnMax}
            onChange={(e) => handleFormChange('expectedReturnMax', e.target.value)}
            placeholder="16.0"
            data-testid="input-max-return"
          />
        </div>
        <div>
          <Label htmlFor="cagr3y">3Y CAGR (%) - Optional</Label>
          <Input
            id="cagr3y"
            type="number"
            step="0.1"
            value={formData.cagr3y}
            onChange={(e) => handleFormChange('cagr3y', e.target.value)}
            placeholder="14.2"
            data-testid="input-cagr-3y"
          />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleFormChange('tags', e.target.value)}
            placeholder="Large Cap, Low Risk, Blue Chip"
            data-testid="input-plan-tags"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="Plan description..."
          rows={3}
          data-testid="textarea-plan-description"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total Plans</h3>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900" data-testid="text-total-plans">
              {totalPlans}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Active Plans</h3>
              <Play className="w-4 h-4 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-success-600" data-testid="text-active-plans">
              {activePlans}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total AUM</h3>
              <DollarSign className="w-4 h-4 text-primary-500" />
            </div>
            <div className="text-2xl font-bold text-primary-600" data-testid="text-total-plan-aum">
              {formatNumber(totalAUM)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Avg Return</h3>
              <TrendingUp className="w-4 h-4 text-warning-500" />
            </div>
            <div className="text-2xl font-bold text-warning-600" data-testid="text-avg-return">
              {avgReturn.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Performance Chart */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Plan Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
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
                    name === 'aum' ? formatCurrency(value) : `${value}%`,
                    name === 'aum' ? 'AUM' : 'Expected Return'
                  ]}
                />
                <Bar dataKey="aum" fill={CHART_COLORS.PRIMARY} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  data-testid="input-search-plans"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 border-slate-200" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {Object.values(PLAN_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Create Plan Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  data-testid="button-create-plan"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New SIP Plan</DialogTitle>
                </DialogHeader>
                <PlanForm />
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePlan}
                    disabled={createPlanMutation.isPending}
                    className="bg-primary-600 hover:bg-primary-700"
                    data-testid="button-submit-create"
                  >
                    {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Plans Management Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Plans Management ({filteredPlans.length} plans)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPlans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Plan Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category & Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Expected Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      AUM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlans.map((plan: any) => {
                    const metrics = calculatePlanMetrics(plan.id);
                    return (
                      <tr key={plan.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <TrendingUp className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900" data-testid={`text-plan-name-${plan.id}`}>
                                {plan.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                Min: {formatCurrency(parseFloat(plan.minSipAmount))} • 
                                Lock-in: {plan.lockInMonths}m
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {plan.category}
                            </Badge>
                            <Badge className={getRiskColor(plan.riskLevel)} data-testid={`badge-plan-risk-${plan.id}`}>
                              {plan.riskLevel}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900" data-testid={`text-plan-return-${plan.id}`}>
                            {plan.expectedReturnDefault}%
                          </div>
                          <div className="text-sm text-slate-500">
                            Range: {plan.expectedReturnMin}% - {plan.expectedReturnMax}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900" data-testid={`text-plan-aum-${plan.id}`}>
                            {formatNumber(metrics.aum)}
                          </div>
                          <div className="text-sm text-slate-500">
                            {metrics.transactionCount} transactions
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(plan.isActive)} data-testid={`badge-plan-status-${plan.id}`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPlan(plan)}
                              className="text-slate-600 hover:text-primary-600"
                              data-testid={`button-edit-plan-${plan.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-warning-600"
                              data-testid={`button-pause-plan-${plan.id}`}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="text-slate-600 hover:text-red-600"
                              data-testid={`button-delete-plan-${plan.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-plans">
                No plans found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SIP Plan</DialogTitle>
          </DialogHeader>
          <PlanForm />
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePlan}
              disabled={updatePlanMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
              data-testid="button-submit-edit"
            >
              {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
