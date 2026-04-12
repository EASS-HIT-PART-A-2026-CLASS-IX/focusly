import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../components/common/Badge'

describe('Badge', () => {
  it('renders the correct label for status values', () => {
    render(<Badge type="status" value="in_progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders the correct label for priority values', () => {
    render(<Badge type="priority" value="high" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders the correct label for category values', () => {
    render(<Badge type="category" value="study" />)
    expect(screen.getByText('Study')).toBeInTheDocument()
  })

  it('renders todo status as "To Do"', () => {
    render(<Badge type="status" value="todo" />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })
})
