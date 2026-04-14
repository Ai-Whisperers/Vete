import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { LocaleSwitcher } from './locale-switcher'

describe('LocaleSwitcher', () => {
  it('renders correctly', () => {
    const { getByText } = render(<LocaleSwitcher />)
    expect(getByText('Español')).toBeInTheDocument()
    expect(getByText('English')).toBeInTheDocument()
  })

  it('changes locale when selected', () => {
    const { getByText } = render(<LocaleSwitcher />)
    const select = getByText('Español')
    fireEvent.change(select, { target: { value: 'en' } })
    expect(getByText('English')).toBeInTheDocument()
  })
})