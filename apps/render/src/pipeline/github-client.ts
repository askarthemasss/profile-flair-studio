export async function executeGithubGraphQL<T = any>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Sigil-Render-Worker/1.0",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      return { data: null, error: `GitHub API error: HTTP ${res.status}` };
    }

    const json: any = await res.json();
    if (json.errors && json.errors.length > 0) {
      return { data: null, error: json.errors[0]?.message || "GraphQL error" };
    }

    return { data: json.data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Failed to query GitHub GraphQL" };
  }
}
