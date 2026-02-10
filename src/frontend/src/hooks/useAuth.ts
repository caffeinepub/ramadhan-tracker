import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserRole, useIsCallerAdmin } from './useBackendQueries';

export function useAuth() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const logout = async () => {
    await clear();
    queryClient.clear();
  };

  return {
    identity,
    login,
    logout,
    loginStatus,
    isAuthenticated,
    userRole,
    isAdmin: isAdmin ?? false,
    isLoading: roleLoading || adminLoading,
  };
}
