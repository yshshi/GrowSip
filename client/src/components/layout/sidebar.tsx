import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  LayersIcon, 
  Calculator, 
  Briefcase, 
  Receipt, 
  Settings, 
  Users,
  X,
  ChartLine
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "SIP Plans", href: "/plans", icon: LayersIcon },
    { name: "Calculators", href: "/calculators", icon: Calculator },
    { name: "My Portfolio", href: "/portfolio", icon: Briefcase },
    { name: "Transactions", href: "/transactions", icon: Receipt },
  ];

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: Settings },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Plans", href: "/admin/plans", icon: LayersIcon },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white w-64 shadow-lg border-r border-slate-200 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 z-50",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 fixed md:relative"
      )}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <ChartLine className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">SIPVault</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onClose}
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary-600 bg-primary-50"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}

          {user?.role === 'admin' && (
            <div className="pt-6 border-t border-slate-100 mt-6">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide px-3 mb-3">
                Admin
              </p>
              {adminNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-colors",
                    isActive(item.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  data-testid={`link-admin-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate" data-testid="text-user-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </p>
              <p className="text-xs text-slate-500 truncate" data-testid="text-user-email">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="text-slate-400 hover:text-slate-600"
              data-testid="button-logout"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
