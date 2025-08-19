import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, UserCheck, UserX, Lock, Unlock, Search, Eye, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [kycFilter, setKycFilter] = useState("All KYC");
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const approveKycMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/kyc/approve`);
    },
    onSuccess: () => {
      toast({
        title: "KYC Approved",
        description: "User KYC has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      console.error("Failed to approve KYC:", error);
      toast({
        title: "Failed to Approve KYC",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const rejectKycMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/kyc/reject`);
    },
    onSuccess: () => {
      toast({
        title: "KYC Rejected",
        description: "User KYC has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      console.error("Failed to reject KYC:", error);
      toast({
        title: "Failed to Reject KYC",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const freezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/freeze`);
    },
    onSuccess: () => {
      toast({
        title: "User Frozen",
        description: "User account has been frozen.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      console.error("Failed to freeze user:", error);
      toast({
        title: "Failed to Freeze User",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const unfreezeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/users/${userId}/unfreeze`);
    },
    onSuccess: () => {
      toast({
        title: "User Unfrozen",
        description: "User account has been unfrozen.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      console.error("Failed to unfreeze user:", error);
      toast({
        title: "Failed to Unfreeze User",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || usersLoading) {
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

  // Filter users
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All Status" || user.status === statusFilter.toLowerCase();
    const matchesKyc = kycFilter === "All KYC" || user.kycStatus === kycFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesKyc;
  });

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'frozen':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getUserDisplayName = (user: any) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email || 'Unknown User';
  };

  const getUserInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  // Calculate summary stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.status === 'active').length;
  const pendingKyc = users.filter((u: any) => u.kycStatus === 'pending').length;
  const approvedKyc = users.filter((u: any) => u.kycStatus === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900" data-testid="text-total-users">
              {totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Active Users</h3>
              <UserCheck className="w-4 h-4 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-success-600" data-testid="text-active-users">
              {activeUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Pending KYC</h3>
              <Filter className="w-4 h-4 text-warning-500" />
            </div>
            <div className="text-2xl font-bold text-warning-600" data-testid="text-pending-kyc">
              {pendingKyc}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-500">Approved KYC</h3>
              <UserCheck className="w-4 h-4 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-success-600" data-testid="text-approved-kyc">
              {approvedKyc}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                data-testid="input-search-users"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-slate-200" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-40 border-slate-200" data-testid="select-kyc-filter">
                  <SelectValue placeholder="All KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All KYC">All KYC</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            User Management ({filteredUsers.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Account Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium text-sm">
                              {getUserInitials(user)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900" data-testid={`text-user-name-${user.id}`}>
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {user.role === 'admin' && (
                                <Badge variant="secondary" className="text-xs">Admin</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900" data-testid={`text-user-email-${user.id}`}>
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getKycStatusColor(user.kycStatus)} data-testid={`badge-kyc-status-${user.id}`}>
                          {user.kycStatus?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getUserStatusColor(user.status)} data-testid={`badge-user-status-${user.id}`}>
                          {user.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Details */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                data-testid={`button-view-user-${user.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">Name</label>
                                      <p className="text-slate-900">{getUserDisplayName(selectedUser)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">Email</label>
                                      <p className="text-slate-900">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">Role</label>
                                      <p className="text-slate-900 capitalize">{selectedUser.role}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">Status</label>
                                      <Badge className={getUserStatusColor(selectedUser.status)}>
                                        {selectedUser.status?.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">KYC Status</label>
                                      <Badge className={getKycStatusColor(selectedUser.kycStatus)}>
                                        {selectedUser.kycStatus?.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">Joined Date</label>
                                      <p className="text-slate-900">{formatDate(selectedUser.createdAt)}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedUser.kycVerifiedAt && (
                                    <div>
                                      <label className="text-sm font-medium text-slate-500">KYC Verified Date</label>
                                      <p className="text-slate-900">{formatDate(selectedUser.kycVerifiedAt)}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* KYC Actions */}
                          {user.kycStatus === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveKycMutation.mutate(user.id)}
                                disabled={approveKycMutation.isPending}
                                className="text-success-600 hover:bg-success-50"
                                data-testid={`button-approve-kyc-${user.id}`}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectKycMutation.mutate(user.id)}
                                disabled={rejectKycMutation.isPending}
                                className="text-red-600 hover:bg-red-50"
                                data-testid={`button-reject-kyc-${user.id}`}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {/* Account Actions */}
                          {user.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => freezeUserMutation.mutate(user.id)}
                              disabled={freezeUserMutation.isPending}
                              className="text-red-600 hover:bg-red-50"
                              data-testid={`button-freeze-user-${user.id}`}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unfreezeUserMutation.mutate(user.id)}
                              disabled={unfreezeUserMutation.isPending}
                              className="text-success-600 hover:bg-success-50"
                              data-testid={`button-unfreeze-user-${user.id}`}
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-users">
                No users found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
