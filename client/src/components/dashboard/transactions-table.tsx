import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TransactionsTableProps {
  transactions: any[];
  plans: any[];
  showViewAll?: boolean;
}

export default function TransactionsTable({ transactions, plans, showViewAll = false }: TransactionsTableProps) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      default:
        return 'secondary';
    }
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

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.name || 'Unknown Plan';
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </CardTitle>
          {showViewAll && (
            <Link href="/transactions">
              <Button 
                variant="link" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 p-0"
                data-testid="link-view-all-transactions"
              >
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900" data-testid={`text-transaction-date-${transaction.id}`}>
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900" data-testid={`text-transaction-plan-${transaction.id}`}>
                      {getPlanName(transaction.planId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600" data-testid={`text-transaction-type-${transaction.id}`}>
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right" data-testid={`text-transaction-amount-${transaction.id}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        className={getStatusColor(transaction.status)}
                        data-testid={`badge-transaction-status-${transaction.id}`}
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500" data-testid="text-no-transactions">
              No transactions found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
