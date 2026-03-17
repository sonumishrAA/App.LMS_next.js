const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export async function callEdgeFunction(
  name: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: any
    headers?: Record<string, string>
    useAuthToken?: boolean
    libraryId?: string
  } = {}
) {
  const { method = 'POST', body, headers = {}, useAuthToken = true, libraryId } = options

  const url = `${SUPABASE_URL}/functions/v1/${name}`
  
  const isFormData = body instanceof FormData
  
  const allHeaders: Record<string, string> = {
    ...headers,
  }

  if (!isFormData) {
    allHeaders['Content-Type'] = 'application/json'
  }

  if (useAuthToken) {
    // For site-2, we use Supabase Auth session token
    const { data: { session } } = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
    if (session?.access_token) {
      allHeaders['Authorization'] = `Bearer ${session.access_token}`
    }
  }

  if (libraryId) {
    allHeaders['x-library-id'] = libraryId
  }

  const res = await fetch(url, {
    method,
    headers: allHeaders,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }

  return res.json()
}
