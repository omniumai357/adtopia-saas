import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminNotification {
  type: string;
  winner?: string;
  data?: any;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, winner, data, timestamp }: AdminNotification = await req.json()

    // Validate required fields
    if (!type || !timestamp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'type and timestamp are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare email content based on notification type
    let emailSubject = '';
    let emailBody = '';

    switch (type) {
      case 'ab_test_completed':
        emailSubject = `A/B Test Completed - Winner: Variant ${winner}`;
        emailBody = `
          <h2>A/B Test Results</h2>
          <p><strong>Winner:</strong> Variant ${winner}</p>
          <p><strong>Completed:</strong> ${new Date(timestamp).toLocaleString()}</p>
          
          <h3>Test Results:</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Variant</th>
              <th>Views</th>
              <th>Conversions</th>
              <th>Rate %</th>
              <th>Uplift %</th>
              <th>Significant</th>
            </tr>
            ${data?.map((variant: any) => `
              <tr>
                <td>${variant.variant}</td>
                <td>${variant.total_views}</td>
                <td>${variant.total_conversions}</td>
                <td>${variant.conversion_rate_percent}%</td>
                <td>${variant.variant === 'B' ? (variant.uplift_percent > 0 ? '+' : '') + variant.uplift_percent + '%' : '-'}</td>
                <td>${variant.variant === 'B' ? (variant.is_statistically_significant ? 'Yes' : 'No') : '-'}</td>
              </tr>
            `).join('') || ''}
          </table>
          
          <p><strong>Action Required:</strong> Update production to use Variant ${winner} for optimal conversion rates.</p>
        `;
        break;
      
      default:
        emailSubject = `Admin Notification - ${type}`;
        emailBody = `
          <h2>Admin Notification</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    }

    // Send email via Resend (assuming it's configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@adtopia.io';

    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'AdTopia Admin <admin@adtopia.io>',
            to: [adminEmail],
            subject: emailSubject,
            html: emailBody,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text());
        } else {
          console.log('Admin notification email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending admin notification email:', emailError);
      }
    } else {
      console.log('Resend API key not configured, skipping email notification');
    }

    // Log the notification
    console.log(`Admin notification sent: ${type}`, {
      winner,
      timestamp,
      data: data ? 'Data included' : 'No data'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin notification sent successfully',
        type,
        winner,
        timestamp
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})