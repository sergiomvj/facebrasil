import { createClient } from './supabase/client';

// Shared instance for the entire application (browser side)
export const supabase = createClient();
