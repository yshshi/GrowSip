import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Moon, Search } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/plans": "SIP Plans",
  "/calculators": "Calculators",
  "/portfolio": "My Portfolio",
  "/transactions": "Transactions",
  "/admin": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/plans": "Plan Management",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const title = pageTitles[location] || "Dashboard";

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="text-page-title">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search plans, transactions..."
              className="w-80 pl-10 pr-4 py-2 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-600 hover:bg-slate-100"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:bg-slate-100"
            data-testid="button-theme-toggle"
          >
            <Moon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
