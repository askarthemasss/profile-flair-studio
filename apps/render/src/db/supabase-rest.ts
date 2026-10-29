export interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

export class SupabaseRest {
  private readonly baseUrl: string;
  private readonly serviceKey: string;

  constructor(config: SupabaseConfig) {
    this.baseUrl = config.url.replace(/\/$/, "");
    this.serviceKey = config.serviceKey;
  }

  private headers(): HeadersInit {
    return {
      apikey: this.serviceKey,
      Authorization: `Bearer ${this.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  async get<T>(table: string, query: string): Promise<T[] | null> {
    if (!this.baseUrl || !this.serviceKey) return null;
    try {
      const res = await fetch(`${this.baseUrl}/rest/v1/${table}?${query}`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async upsert<T>(table: string, record: Record<string, unknown>): Promise<T | null> {
    if (!this.baseUrl || !this.serviceKey) return null;
    try {
      const res = await fetch(`${this.baseUrl}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          ...this.headers(),
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(record),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (Array.isArray(data) ? data[0] : data) as T;
    } catch {
      return null;
    }
  }

  async delete(table: string, query: string): Promise<boolean> {
    if (!this.baseUrl || !this.serviceKey) return true;
    try {
      const res = await fetch(`${this.baseUrl}/rest/v1/${table}?${query}`, {
        method: "DELETE",
        headers: this.headers(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
