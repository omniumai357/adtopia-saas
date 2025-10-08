// Create: src/pages/api/log-error.ts
// Error logging API route for AdTopia error monitoring

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const errorData = req.body;
    
    // Log to Supabase error_logs table
    const { data, error } = await supabase.from('error_logs').insert({
      error_message: errorData.error.message,
      error_stack: errorData.error.stack,
      error_name: errorData.error.name,
      error_info: errorData.errorInfo,
      user_agent: req.headers['user-agent'],
      url: errorData.url,
      user_id: errorData.user,
      created_at: errorData.timestamp
    });

    if (error) {
      console.error('Supabase error logging failed:', error);
      return res.status(500).json({ error: 'Database logging failed' });
    }

    // Also log to console for immediate visibility
    console.error('AdTopia Frontend Error:', {
      message: errorData.error.message,
      stack: errorData.error.stack,
      url: errorData.url,
      user: errorData.user,
      timestamp: errorData.timestamp
    });

    res.status(200).json({ 
      success: true, 
      logged: true
    });
  } catch (error) {
    console.error('Error logging API failed:', error);
    res.status(500).json({ error: 'Logging failed' });
  }
}
