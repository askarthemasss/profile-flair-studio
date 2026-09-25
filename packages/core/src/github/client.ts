import type { RateLimit } from "./types";

export const GRAPHQL_URL = "https://api.github.com/graphql";

export class GitHubGraphQLError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly kind: "not_found" | "rate_limited" | "auth" | "other",
  ) {
    super(message);
    this.name = "GitHubGraphQLError";
  }
}

export interface GqlResult<T> {
  data: T;
  cost: number;
}

/** POST one GraphQL document. Logs rateLimit cost on every call. */
export async function graphql<T extends { rateLimit?: RateLimit | null }>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
  label: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GqlResult<T>> {
  const res = await fetchImpl(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Sigil",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 401) throw new GitHubGraphQLError("Bad GitHub token", 401, "auth");
  if (res.status === 403 || res.status === 429) {
    throw new GitHubGraphQLError(`GitHub rate limit (${res.status})`, res.status, "rate_limited");
  }
  if (!res.ok) throw new GitHubGraphQLError(`GitHub ${res.status}: ${await res.text()}`, res.status, "other");

  const body = (await res.json()) as {
    data?: T;
    errors?: { type?: string; message: string }[];
  };
  const errors = body.errors ?? [];
  if (errors.some((e) => e.type === "NOT_FOUND")) {
    throw new GitHubGraphQLError("User not found", 404, "not_found");
  }
  if (errors.some((e) => e.type === "RATE_LIMITED")) {
    throw new GitHubGraphQLError("GitHub rate limit", 403, "rate_limited");
  }
  if (errors.length > 0 || !body.data) {
    throw new GitHubGraphQLError(errors.map((e) => e.message).join("; ") || "Empty response", 200, "other");
  }
  const rate = body.data.rateLimit;
  const cost = rate?.cost ?? 0;
  console.info(`[github] ${label} cost=${cost} remaining=${rate?.remaining ?? "?"} resetAt=${rate?.resetAt ?? "?"}`);
  return { data: body.data, cost };
}
