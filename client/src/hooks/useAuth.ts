import type { User } from "@/shared/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("auth_token");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!token,
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.clear();
    setLocation("/auth/login");
  };

  return {
    user,
    isLoading: !user && !!token,
    isAuthenticated: !!user && !!token,
    logout,
    token,
  };
}
