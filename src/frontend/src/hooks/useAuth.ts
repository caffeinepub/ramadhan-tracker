import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserRole, useIsCallerAdmin } from './useBackendQueries';

export function useAuth() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const roleQuery = useGetCallerUserRole();
  const adminQuery = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const logout = async () => {
    await clear();
    queryClient.clear();
  };

  const retry = () => {
    roleQuery.refetch();
    adminQuery.refetch();
  };

  const hasError = roleQuery.isError || adminQuery.isError;

  return {
    identity,
    login,
    logout,
    loginStatus,
    isAuthenticated,
    userRole: roleQuery.data,
    isAdmin: adminQuery.data ?? false,
    isLoading: roleQuery.isLoading || adminQuery.isLoading,
    hasError,
    retry,
  };
}
