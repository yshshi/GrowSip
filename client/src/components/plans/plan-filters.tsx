import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface PlanFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  riskFilter: string;
  onRiskChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function PlanFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  riskFilter,
  onRiskChange,
  sortBy,
  onSortChange,
}: PlanFiltersProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              data-testid="input-search-plans"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-48 border-slate-200" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                <SelectItem value="Large Cap">Large Cap</SelectItem>
                <SelectItem value="Mid Cap">Mid Cap</SelectItem>
                <SelectItem value="Small Cap">Small Cap</SelectItem>
                <SelectItem value="Multi Cap">Multi Cap</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={onRiskChange}>
              <SelectTrigger className="w-40 border-slate-200" data-testid="select-risk-filter">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Risk Level">All Risk Levels</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Very High">Very High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48 border-slate-200" data-testid="select-sort-by">
                <SelectValue placeholder="Sort by Return" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sort by Return">Sort by Return</SelectItem>
                <SelectItem value="Highest Return">Highest Return</SelectItem>
                <SelectItem value="Lowest Risk">Lowest Risk</SelectItem>
                <SelectItem value="Min Investment">Min Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
