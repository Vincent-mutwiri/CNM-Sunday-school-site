import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '../useAuth'
import { vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/utils/api'

vi.mock('@/utils/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useAuth', () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('logs in successfully', async () => {
    const user = { _id: '1', name: 'Test', email: 't@test.com', role: 'Teacher', profilePictureUrl: '', createdAt: '', updatedAt: '' }
    ;(apiClient.post as any).mockResolvedValue({ token: 'token', user })
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      result.current.login({ email: 't@test.com', password: 'pass' })
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.user).toEqual(user)
  })

  it('handles login failure', async () => {
    ;(apiClient.post as any).mockRejectedValue(new Error('Invalid'))
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      result.current.login({ email: 't@test.com', password: 'wrong' })
    })

    await waitFor(() => expect(result.current.loginError).toBeDefined())
    expect(result.current.isAuthenticated).toBe(false)
  })
})
