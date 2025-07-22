import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTeacherClasses } from '../useTeacherClasses'
import { vi } from 'vitest'
import { apiClient } from '@/utils/api'

vi.mock('@/utils/api', () => ({
  apiClient: {
    get: vi.fn()
  }
}))

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useTeacherClasses', () => {
  it('returns classes from the api', async () => {
    const classes = [{ _id: '1', name: 'A', ageRange: '', capacity: 10, createdAt: '', updatedAt: '', students: [], schedule: { _id: 's', date: '' } }]
    ;(apiClient.get as any).mockResolvedValue({ classes })
    const { result } = renderHook(() => useTeacherClasses(), { wrapper })

    await waitFor(() => expect(result.current.data?.classes).toEqual(classes))
  })
})
