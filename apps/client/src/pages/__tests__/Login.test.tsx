import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Login from '../Login'
import { vi } from 'vitest'
import { apiClient } from '@/utils/api'

vi.mock('@/utils/api', () => ({
  apiClient: {
    post: vi.fn()
  }
}))

const renderWithProviders = () => {
  const queryClient = new QueryClient()
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('Login page', () => {
  it('allows a user to log in and redirects to dashboard', async () => {
    const user = { _id: '1', name: 'Test', email: 't@test.com', role: 'Teacher', profilePictureUrl: '', createdAt: '', updatedAt: '' }
    ;(apiClient.post as any).mockResolvedValue({ token: 'token', user })
    renderWithProviders()

    await userEvent.type(screen.getByLabelText(/email/i), 't@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
  })
})
