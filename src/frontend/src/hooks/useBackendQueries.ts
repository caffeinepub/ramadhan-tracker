import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, DailyContent, Task, Date_ } from '../backend';
import { Principal } from '@dfinity/principal';

const PROFILE_QUERY_TIMEOUT = 10000; // 10 seconds timeout for profile query

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), PROFILE_QUERY_TIMEOUT)
      );
      
      const profilePromise = actor.getCallerUserProfile();
      
      return Promise.race([profilePromise, timeoutPromise]);
    },
    enabled: !!actor && !actorFetching,
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsAdminBootstrapAvailable() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['isAdminBootstrapAvailable'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAdminBootstrapAvailable();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteToAdmin(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['isAdminBootstrapAvailable'] });
    },
  });
}

// Task Queries
export function useGetTask(date: Date_) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task | null>({
    queryKey: ['task', date.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTask(date);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, task }: { date: Date_; task: Task }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateTask(date, task);
    },
    onSuccess: (_, variables) => {
      // Immediately refetch the specific task to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ['task', variables.date.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tasksInRange'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

export function useGetTasksInRange(startDate: Date_, endDate: Date_) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Date_, Task][]>({
    queryKey: ['tasksInRange', startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTasksInRange(startDate, endDate);
    },
    enabled: !!actor && !actorFetching,
  });
}

// Daily Content Queries
export function useGetContents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyContent[]>({
    queryKey: ['dailyContents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getContents();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

export function useCreateOrUpdateContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentType, content }: { contentType: bigint; content: DailyContent }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateContent(contentType, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyContents'] });
    },
  });
}

export function useDeleteContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentType: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteContent(contentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyContents'] });
    },
  });
}

// Admin User Management
export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, profile }: { user: Principal; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(user, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, profile }: { user: Principal; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(user, profile);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useDeactivateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deactivateUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useReactivateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reactivateUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useGetUserStatistics(user: Principal, startDate: Date_, endDate: Date_) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['userStatistics', user.toString(), startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserStatistics(user, startDate, endDate);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

// Sedekah Payment Link Queries
export function useGetSedekahPaymentLink() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['sedekahPaymentLink'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSedekahPaymentLink();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetSedekahPaymentLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setSedekahPaymentLink(link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedekahPaymentLink'] });
    },
  });
}
