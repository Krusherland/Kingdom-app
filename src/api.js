const BASE = `${import.meta.env.VITE_API_URL}/api`

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    let msg = res.statusText
    try {
      const body = await res.json()
      msg = body.message ?? body.error ?? msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  createGame: (nickname) =>
    request('/games', { method: 'POST', body: JSON.stringify({ nickname }) }),

  joinGame: (code, nickname) =>
    request(`/games/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    }),

  startGame: (code, token, opts = {}) =>
    request(`/games/${code}/start`, {
      method: 'POST',
      headers: { 'X-Session-Token': token },
      body: JSON.stringify(opts),
    }),

  getState: (code) =>
    request(`/games/${code}/state`),

  getMyState: (code, token) =>
    request(`/games/${code}/me`, {
      headers: { 'X-Session-Token': token },
    }),

  submitAction: (code, token, actionType, targetNickname) =>
    request(`/games/${code}/action`, {
      method: 'POST',
      headers: { 'X-Session-Token': token },
      body: JSON.stringify({ actionType, targetNickname }),
    }),

  submitGuess: (code, token, word) =>
    request(`/games/${code}/guess`, {
      method: 'POST',
      headers: { 'X-Session-Token': token },
      body: JSON.stringify({ word }),
    }),

  getMyStats: (token) =>
    request('/stats/me', { headers: { 'X-Session-Token': token } }),

  getLeaderboard: (limit = 20) =>
    request(`/stats/leaderboard?limit=${limit}`),
}
