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
