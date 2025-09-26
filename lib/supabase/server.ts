/**
 * Mock Supabase server client for browser-only environment
 */
export async function createClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: null, error: { message: "Server auth not available in browser environment" } }),
      signUp: () =>
        Promise.resolve({ data: null, error: { message: "Server auth not available in browser environment" } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () =>
        Promise.resolve({ data: null, error: { message: "Server database not available in browser environment" } }),
      update: () =>
        Promise.resolve({ data: null, error: { message: "Server database not available in browser environment" } }),
      delete: () =>
        Promise.resolve({ data: null, error: { message: "Server database not available in browser environment" } }),
    }),
  } as any
}
