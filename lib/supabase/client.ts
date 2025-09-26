let supabaseClient: any = null

export function createClient() {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase environment variables not found. Auth features will be disabled.")
      supabaseClient = {
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          signOut: () => Promise.resolve({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          update: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
      } as any
      return supabaseClient
    }

    import("@supabase/ssr")
      .then(({ createBrowserClient }) => {
        supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
      })
      .catch(() => {
        // Fallback to mock client if import fails
        supabaseClient = {
          auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
            signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          },
          from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
            update: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
            delete: () => Promise.resolve({ data: null, error: { message: "Supabase not available" } }),
          }),
        } as any
      })

    // Return mock client immediately while async import happens
    supabaseClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase loading" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase loading" } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase loading" } }),
        update: () => Promise.resolve({ data: null, error: { message: "Supabase loading" } }),
        delete: () => Promise.resolve({ data: null, error: { message: "Supabase loading" } }),
      }),
    } as any
    return supabaseClient
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error)
    supabaseClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase initialization failed" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase initialization failed" } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase initialization failed" } }),
        update: () => Promise.resolve({ data: null, error: { message: "Supabase initialization failed" } }),
        delete: () => Promise.resolve({ data: null, error: { message: "Supabase initialization failed" } }),
      }),
    } as any
    return supabaseClient
  }
}
