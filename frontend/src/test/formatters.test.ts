import { describe, it, expect } from 'vitest'
import { formatMinutes, formatHour, formatDate } from '../utils/formatters'

describe('formatMinutes', () => {
  it('formats minutes under an hour', () => {
    expect(formatMinutes(45)).toBe('45m')
  })

  it('formats exactly one hour', () => {
    expect(formatMinutes(60)).toBe('1h')
  })

  it('formats hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1h 30m')
  })

  it('formats multiple hours', () => {
    expect(formatMinutes(150)).toBe('2h 30m')
  })
})

describe('formatHour', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatHour(0)).toBe('12:00 AM')
  })

  it('formats noon as 12:00 PM', () => {
    expect(formatHour(12)).toBe('12:00 PM')
  })

  it('formats morning hour', () => {
    expect(formatHour(9)).toBe('9:00 AM')
  })

  it('formats afternoon hour', () => {
    expect(formatHour(17)).toBe('5:00 PM')
  })
})

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    expect(formatDate('2026-04-12')).toMatch(/Apr.*12.*2026/)
  })

  it('handles an invalid date string gracefully', () => {
    expect(typeof formatDate('')).toBe('string')
  })
})
