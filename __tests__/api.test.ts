// Basic API tests
import { describe, it, expect } from 'vitest'

describe('API Health Check', () => {
  it('should return healthy status', async () => {
    const response = await fetch('/api/health')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
  })
})
