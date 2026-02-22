const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export async function supabaseFetch(
  path: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers ?? {});
  headers.set("apikey", supabaseAnonKey!);
  headers.set("Authorization", `Bearer ${supabaseAnonKey!}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}
