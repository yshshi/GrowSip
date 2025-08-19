import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export default function Transactions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    retry: false,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/plans"],
    retry: false,
  });

  if (isLoading || transactionsLoading || plansLoading) {
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
            <div className="h-8 bg-slate-200 rounded"></div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    const plan = plans.find((p: any) => p.id === transaction.planId);
    const planName = plan?.name || 'Unknown Plan';
    
    const matchesSearch = 
      planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.gatewayRef?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All Status" || transaction.status === statusFilter;
    const matchesType = typeFilter === "All Types" || transaction.type === typeFilter;
    
    const transactionDate = new Date(transaction.createdAt);
    const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
    const matchesDateTo = !dateTo || transactionDate <= dateTo;
    
    return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-success-100 text-success-800';
      case 'PENDING':
        return 'bg-warning-100 text-warning-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SIP':
        return 'bg-primary-100 text-primary-800';
      case 'REFUND':
        return 'bg-orange-100 text-orange-800';
      case 'ADJUSTMENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find((p: any) => p.id === planId);
    return plan?.name || 'Unknown Plan';
  };

  const calculateTotals = () => {
    const totalAmount = filteredTransactions.reduce((sum: number, tx: any) => 
      sum + parseFloat(tx.amount || 0), 0
    );
    const successfulAmount = filteredTransactions
      .filter((tx: any) => tx.status === 'SUCCESS')
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);
    
    return { totalAmount, successfulAmount };
  };

  const { totalAmount, successfulAmount } = calculateTotals();

  const exportTransactions = () => {
    const headers = ['Date', 'Plan', 'Type', 'Amount', 'Status', 'Gateway Ref'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((tx: any) => [
        new Date(tx.createdAt).toLocaleDateString('en-IN'),
        getPlanName(tx.planId),
        tx.type,
        tx.amount,
        tx.status,
        tx.gatewayRef || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Transactions</h3>
            <div className="text-2xl font-bold text-slate-900" data-testid="text-total-transactions">
              {filteredTransactions.length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Amount</h3>
            <div className="text-2xl font-bold text-slate-900" data-testid="text-total-amount">
              {formatCurrency(totalAmount)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Successful Amount</h3>
            <div className="text-2xl font-bold text-success-600" data-testid="text-successful-amount">
              {formatCurrency(successfulAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                data-testid="input-search-transactions"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-slate-200" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 border-slate-200" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="SIP">SIP</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-40 justify-start text-left font-normal border-slate-200",
                        !dateFrom && "text-muted-foreground"
                      )}
                      data-testid="button-date-from"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-40 justify-start text-left font-normal border-slate-200",
                        !dateTo && "text-muted-foreground"
                      )}
                      data-testid="button-date-to"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button 
                variant="outline" 
                onClick={exportTransactions}
                className="border-slate-200 hover:bg-slate-50"
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Transaction History ({filteredTransactions.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedTransactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Gateway Ref
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900" data-testid={`text-transaction-date-${transaction.id}`}>
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900" data-testid={`text-transaction-plan-${transaction.id}`}>
                          {getPlanName(transaction.planId)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getTypeColor(transaction.type)} data-testid={`badge-transaction-type-${transaction.id}`}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right" data-testid={`text-transaction-amount-${transaction.id}`}>
                          {formatCurrency(parseFloat(transaction.amount))}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={getStatusColor(transaction.status)} data-testid={`badge-transaction-status-${transaction.id}`}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600" data-testid={`text-transaction-gateway-${transaction.id}`}>
                          {transaction.gatewayRef || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-previous-page"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-slate-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-transactions">
                No transactions found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
