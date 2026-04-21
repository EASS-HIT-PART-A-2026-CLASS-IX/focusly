const BASE = '/api'

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function loginApi(username: string, password: string): Promise<TokenResponse> {
  // OAuth2 expects application/x-www-form-urlencoded
  const res = await fetch(`${BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }))
    throw new Error(err.detail ?? 'Login failed')
  }
  return res.json()
}

export async function registerApi(
  username: string,
  password: string,
  role: 'user' | 'admin' = 'user',
): Promise<{ id: number; username: string; role: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }))
    throw new Error(err.detail ?? 'Registration failed')
  }
  return res.json()
}
