const base = import.meta.env.VITE_API_URL || "";

export async function api(path, options = {}) {
  const { headers, body, ...rest } = options;
  const res = await fetch(`${base}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data?.message
        ? data.message
        : typeof data === "string"
          ? data
          : res.statusText;
    throw new Error(msg || "Request failed");
  }
  return data;
}
