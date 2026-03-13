export async function http<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: json?.error || `http_${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network_error" };
  }
}

