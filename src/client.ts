const BASE_URL = "https://rest.api.glasshive.com/partner/v1";

function getApiKey(): string {
  const key = process.env.GLASSHIVE_API_KEY;
  if (!key) {
    throw new Error("GLASSHIVE_API_KEY environment variable is not set");
  }
  return key;
}

export class GlassHiveError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "GlassHiveError";
  }
}

export async function ghRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    authorization: getApiKey(),
    "Content-Type": "application/json",
    "User-Agent": "glasshive-mcp/0.1.0",
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      typeof json.message === "string" ? json.message : response.statusText;
    throw new GlassHiveError(response.status, message);
  }

  return json as T;
}
