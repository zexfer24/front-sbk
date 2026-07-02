type ChatwootConfig = {
  baseUrl: string
  apiToken: string
  accountId: string
}

let cached: ChatwootConfig | null | undefined

export function getChatwootConfig(): ChatwootConfig | null {
  if (cached !== undefined) return cached

  const baseUrl = process.env.CHATWOOT_URL
  const apiToken = process.env.CHATWOOT_API_TOKEN
  const accountId = process.env.CHATWOOT_ACCOUNT_ID

  if (!baseUrl || !apiToken || !accountId) {
    cached = null
    return null
  }

  cached = {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiToken,
    accountId,
  }
  return cached
}

export async function chatwootFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const config = getChatwootConfig()
  if (!config) throw new Error("Chatwoot no configurado")

  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      api_access_token: config.apiToken,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Chatwoot error ${res.status}: ${body}`)
  }

  return res.json()
}
