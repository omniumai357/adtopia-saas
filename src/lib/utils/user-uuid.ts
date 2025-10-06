// User UUID utilities for admin operations
// Provides secure UUID lookup and validation

interface UUIDResult {
  success: boolean;
  uuid?: string;
  error?: string;
}

/**
 * Get current user UUID from Supabase auth
 * @returns Promise<UUIDResult> - Contains UUID or error
 */
export async function getCurrentUserUUID(): Promise<UUIDResult> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'getCurrentUserUUID can only be called in browser environment'
      };
    }

    // Check if Supabase client is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        error: 'Supabase environment variables not configured'
      };
    }

    // Import Supabase client dynamically
    const { createBrowserClient } = await import('@supabase/ssr');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: `Auth error: ${error.message}`
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'No authenticated user found'
      };
    }

    return {
      success: true,
      uuid: user.id
    };

  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get user UUID by email (for admin operations)
 * @param email - User email address
 * @returns Promise<UUIDResult> - Contains UUID or error
 */
export async function getUserUUIDByEmail(email: string): Promise<UUIDResult> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'getUserUUIDByEmail can only be called in browser environment'
      };
    }

    // Check if Supabase client is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        error: 'Supabase environment variables not configured'
      };
    }

    // Import Supabase client dynamically
    const { createBrowserClient } = await import('@supabase/ssr');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Query auth.users table (requires service role key in production)
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }

    if (!data) {
      return {
        success: false,
        error: `No user found with email: ${email}`
      };
    }

    return {
      success: true,
      uuid: data.id
    };

  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate UUID format
 * @param uuid - UUID string to validate
 * @returns boolean - True if valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get admin users with their emails
 * @returns Promise<Array<{user_id: string, email: string, role: string}>>
 */
export async function getAdminUsers(): Promise<Array<{user_id: string, email: string, role: string}>> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return [];
    }

    // Check if Supabase client is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
    }

    // Import Supabase client dynamically
    const { createBrowserClient } = await import('@supabase/ssr');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Query user_roles with auth.users join
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        auth_users:user_id (
          email
        )
      `)
      .eq('role', 'admin');

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return data?.map((item: any) => ({
      user_id: item.user_id,
      email: item.auth_users?.email || 'Unknown',
      role: item.role
    })) || [];

  } catch (error) {
    console.error('Error in getAdminUsers:', error);
    return [];
  }
}

/**
 * Grant admin role to user by email
 * @param email - User email address
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function grantAdminRole(email: string): Promise<{success: boolean, error?: string}> {
  try {
    // First get the UUID for the email
    const uuidResult = await getUserUUIDByEmail(email);
    
    if (!uuidResult.success || !uuidResult.uuid) {
      return {
        success: false,
        error: uuidResult.error || 'Failed to get user UUID'
      };
    }

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'grantAdminRole can only be called in browser environment'
      };
    }

    // Check if Supabase client is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        error: 'Supabase environment variables not configured'
      };
    }

    // Import Supabase client dynamically
    const { createBrowserClient } = await import('@supabase/ssr');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Insert admin role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: uuidResult.uuid,
        role: 'admin'
      });

    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }

    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
