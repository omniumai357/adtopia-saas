import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminNotificationRequest {
  type: 'ab_test_completed';
  winner: string;
  data: Array<{
    variant: string;
    total_views: number;
    total_conversions: number;
    conversion_rate_percent: number;
    uplift_percent: number;
    is_statistically_significant: boolean;
  }>;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { type, winner, data, timestamp }: AdminNotificationRequest = await req.json()

    // Validate required fields
    if (!type || !winner || !data || !timestamp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: type, winner, data, timestamp' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare email content
    const variantA = data.find(d => d.variant === 'A')
    const variantB = data.find(d => d.variant === 'B')
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>A/B Test Completed - AdTopia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .stats-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .stats-table th, .stats-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .stats-table th { background: #f3f4f6; font-weight: bold; }
          .winner { background: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .variant-a { color: #3B82F6; font-weight: bold; }
          .variant-b { color: #10B981; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 A/B Test Completed</h1>
            <p>AdTopia Onboarding CTA Test Results</p>
          </div>
          <div class="content">
            <h2>Test Summary</h2>
            <p>The A/B test for the onboarding CTA has been completed. Here are the results:</p>
            
            <h3>Winner: <span class="winner">Variant ${winner}</span></h3>
            
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>Views</th>
                  <th>Conversions</th>
                  <th>Conversion Rate</th>
                  <th>Uplift</th>
                  <th>Significance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="variant-a">Variant A</span></td>
                  <td>${variantA?.total_views.toLocaleString() || 0}</td>
                  <td>${variantA?.total_conversions.toLocaleString() || 0}</td>
                  <td>${variantA?.conversion_rate_percent || 0}%</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td><span class="variant-b">Variant B</span></td>
                  <td>${variantB?.total_views.toLocaleString() || 0}</td>
                  <td>${variantB?.total_conversions.toLocaleString() || 0}</td>
                  <td>${variantB?.conversion_rate_percent || 0}%</td>
                  <td>${variantB?.uplift_percent > 0 ? '+' : ''}${variantB?.uplift_percent || 0}%</td>
                  <td>${variantB?.is_statistically_significant ? 'Significant' : 'Not Significant'}</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Key Insights</h3>
            <ul>
              <li><strong>Total Views:</strong> ${(variantA?.total_views || 0) + (variantB?.total_views || 0)}</li>
              <li><strong>Total Conversions:</strong> ${(variantA?.total_conversions || 0) + (variantB?.total_conversions || 0)}</li>
              <li><strong>Overall Conversion Rate:</strong> ${(((variantA?.total_conversions || 0) + (variantB?.total_conversions || 0)) / ((variantA?.total_views || 0) + (variantB?.total_views || 0)) * 100).toFixed(2)}%</li>
              <li><strong>Test Duration:</strong> 30 days</li>
              <li><strong>Completed:</strong> ${new Date(timestamp).toLocaleString()}</li>
            </ul>
            
            <h3>Recommendation</h3>
            <p>Based on the test results, <strong>Variant ${winner}</strong> has been selected as the winner and will be deployed to all users.</p>
            
            <div class="footer">
              <p>This notification was automatically generated by the AdTopia A/B Testing System.</p>
              <p>For questions or concerns, please contact the development team.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AdTopia A/B Testing <noreply@adtopia.io>',
        to: ['omniumai357@example.com'], // Add admin emails here
        subject: `A/B Test Completed - Winner: Variant ${winner}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Resend API error:', errorData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email notification',
          details: errorData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()

    // Log successful notification
    console.log(`Admin notification sent for A/B test completion:`, {
      type,
      winner,
      total_views: (variantA?.total_views || 0) + (variantB?.total_views || 0),
      total_conversions: (variantA?.total_conversions || 0) + (variantB?.total_conversions || 0),
      email_id: emailResult.id
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin notification sent successfully',
        email_id: emailResult.id,
        winner: winner
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
