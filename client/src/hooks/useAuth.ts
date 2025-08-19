import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Check if user has a token
  const token = localStorage.getItem("auth_token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!token, // Only run query if token exists
  });

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("auth_token");
    
    // Clear all queries
    queryClient.clear();
    
    // Redirect to login
    setLocation("/auth/login");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
    token,
  };
}
