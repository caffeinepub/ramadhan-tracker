import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserRole, useIsCallerAdmin } from './useBackendQueries';

export function useAuth() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const roleQuery = useGetCallerUserRole();
  const adminQuery = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Auth is resolved when:
  // 1. Internet Identity initialization is complete (not 'initializing')
  // 2. AND either we have an authenticated identity OR initialization finished with no identity
  const isAuthResolved = !isInitializing && (loginStatus === 'idle' || loginStatus === 'success' || loginStatus === 'loginError');

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
    isAuthResolved,
    userRole: roleQuery.data,
    isAdmin: adminQuery.data ?? false,
    isLoading: roleQuery.isLoading || adminQuery.isLoading,
    hasError,
    retry,
  };
}
