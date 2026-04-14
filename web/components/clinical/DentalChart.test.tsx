import { render, fireEvent, waitFor } from '@testing-library/react'
import { DentalChart } from './DentalChart'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_SUPABASE_URL } from '@/lib/supabase'

const server = setupServer(
  rest.get(`${NEXT_PUBLIC_SUPABASE_URL}/api/pets/:petId/dental-chart`, (req, res, ctx) => {
    return res(ctx.json([{ id: 1, condition: 'healthy', procedure: 'none' }]))
  })
)

describe('DentalChart component', () => {
  it('renders dental chart', async () => {
    const { getByText } = render(<DentalChart petId={1} />)

    await waitFor(() => expect(getByText('Tooth 1')).toBeInTheDocument())
    expect(getByText('healthy')).toBeInTheDocument()
    expect(getByText('none')).toBeInTheDocument()
  })

  it('handles error', async () => {
    server.use(
      rest.get(`${NEXT_PUBLIC_SUPABASE_URL}/api/pets/:petId/dental-chart`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Error loading dental chart' }))
      })
    )

    const { getByText } = render(<DentalChart petId={1} />)

    await waitFor(() => expect(getByText('Error loading dental chart')).toBeInTheDocument())
  })
})