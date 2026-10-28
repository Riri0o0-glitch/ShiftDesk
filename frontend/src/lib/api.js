const API_BASE_URL = 'http://localhost:5000'

async function request(path, options = {}) {
  const { method = 'GET', body, params } = options
  const url = new URL(`${API_BASE_URL}${path}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  const response = await fetch(url, {
    method,
    headers:
      body === undefined
        ? undefined
        : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    )
  }

  return data
}

export async function checkBackendHealth() {
  return request('/api/health')
}

export async function createGoal(payload) {
  return request('/api/goals', {
    method: 'POST',
    body: payload
  })
}

export async function listGoals(workspace) {
  return request('/api/goals', {
    params: { workspace }
  })
}