import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api';
import { AuthResponse, User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials) as AuthResponse;
      console.log('Login response:', { user: response.user, hasToken: !!response.token });
      return response;
    },
    onSuccess: (data) => {
      if (!data.token) {
        console.error('No token received in login response');
        throw new Error('Authentication failed: No token received');
      }
      login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      return apiClient.post('/auth/register', userData);
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<{ user: User }> => {
      return apiClient.get('/auth/me');
    },
    enabled: !!token,
    retry: false,
  });

  const logoutUser = () => {
    logout();
    queryClient.clear();
  };

  return {
    user: currentUser?.user || user,
    token,
    isAuthenticated,
    isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutUser,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};

