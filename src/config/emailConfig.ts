// Email Configuration for AdTopia
// Centralized email settings and templates

export const EMAIL_CONFIG = {
  // Support Email
  SUPPORT_EMAIL: 'support@adtopia.io',
  
  // From Email (should be verified in your email service)
  FROM_EMAIL: 'noreply@adtopia.io',
  
  // Company Information
  COMPANY_NAME: 'AdTopia',
  COMPANY_URL: 'https://adtopia.io',
  
  // Email Templates
  TEMPLATES: {
    PAYMENT_CONFIRMATION: {
      subject: 'Payment Confirmed - Welcome to AdTopia! 🎉',
      template: 'payment-confirmation'
    },
    QR_CODE_READY: {
      subject: 'Your QR Code is Ready! 📱',
      template: 'qr-code-ready'
    },
    WELCOME: {
      subject: 'Welcome to AdTopia - Let\'s Get Started!',
      template: 'welcome'
    },
    SUPPORT_REQUEST: {
      subject: 'Support Request Received',
      template: 'support-request'
    }
  }
};

// Email Service Configuration
export const EMAIL_SERVICE = {
  // Resend (recommended for production)
  RESEND: {
    API_KEY: process.env.RESEND_API_KEY,
    FROM_DOMAIN: 'adtopia.io'
  },
  
  // SendGrid (alternative)
  SENDGRID: {
    API_KEY: process.env.SENDGRID_API_KEY,
    FROM_EMAIL: 'noreply@adtopia.io'
  },
  
  // SMTP (for custom servers)
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS
  }
};

// Email Templates (HTML)
export const EMAIL_TEMPLATES = {
  PAYMENT_CONFIRMATION: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmed - AdTopia</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Confirmed!</h1>
          <p>Welcome to AdTopia</p>
        </div>
        <div class="content">
          <h2>Thank you for your purchase!</h2>
          <p>Your payment has been successfully processed and your order is being prepared.</p>
          
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Package:</strong> \${'{productName}'}</li>
            <li><strong>Amount:</strong> $\${'{amount}'}</li>
            <li><strong>Order ID:</strong> \${'{orderId}'}</li>
            <li><strong>Date:</strong> \${'{orderDate}'}</li>
          </ul>
          
          <h3>What happens next?</h3>
          <ol>
            <li>Your custom QR code will be generated within 24 hours</li>
            <li>You'll receive a download link via email</li>
            <li>Access your analytics dashboard</li>
            <li>Get 24/7 support whenever you need it</li>
          </ol>
          
          <a href="\${'{dashboardUrl}'}" class="button">Access Your Dashboard</a>
          
          <p>If you have any questions, don't hesitate to contact our support team at <a href="mailto:\${'{supportEmail}'}">\${'{supportEmail}'}</a></p>
        </div>
        <div class="footer">
          <p>© 2025 AdTopia. All rights reserved.</p>
          <p><a href="\${'{companyUrl}'}">Visit our website</a> | <a href="\${'{unsubscribeUrl}'}">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  QR_CODE_READY: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your QR Code is Ready - AdTopia</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .qr-preview { text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📱 Your QR Code is Ready!</h1>
          <p>Download and start using your custom QR code</p>
        </div>
        <div class="content">
          <h2>Great news!</h2>
          <p>Your custom QR code has been generated and is ready for download.</p>
          
          <div class="qr-preview">
            <p><strong>QR Code Preview:</strong></p>
            <p>[QR Code Image Placeholder]</p>
          </div>
          
          <h3>Download Options:</h3>
          <ul>
            <li>High-resolution PNG (recommended for print)</li>
            <li>SVG vector format (scalable)</li>
            <li>PDF with usage guidelines</li>
            <li>Social media optimized versions</li>
          </ul>
          
          <a href="\${'{downloadUrl}'}" class="button">Download Your QR Code</a>
          
          <h3>Usage Tips:</h3>
          <ul>
            <li>Test your QR code before printing</li>
            <li>Ensure good contrast for scanning</li>
            <li>Keep the QR code at least 1 inch in size</li>
            <li>Place in a visible, accessible location</li>
          </ul>
          
          <p>Need help? Contact us at <a href="mailto:\${'{supportEmail}'}">\${'{supportEmail}'}</a></p>
        </div>
        <div class="footer">
          <p>© 2025 AdTopia. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Email sending functions
export const sendEmail = async (to: string, template: string, data: Record<string, any>) => {
  // This would integrate with your email service (Resend, SendGrid, etc.)
  console.log(`Sending email to ${to} with template ${template}`, data);
  
  // In production, this would:
  // 1. Get the template from EMAIL_TEMPLATES
  // 2. Replace placeholders with actual data
  // 3. Send via your chosen email service
  // 4. Log the result
  
  return { success: true, messageId: 'mock-message-id' };
};

// Specific email functions
export const sendPaymentConfirmation = async (customerEmail: string, orderData: any) => {
  return sendEmail(customerEmail, 'PAYMENT_CONFIRMATION', {
    productName: orderData.productName,
    amount: orderData.amount,
    orderId: orderData.orderId,
    orderDate: new Date().toLocaleDateString(),
    dashboardUrl: `${EMAIL_CONFIG.COMPANY_URL}/dashboard`,
    supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
    companyUrl: EMAIL_CONFIG.COMPANY_URL,
    unsubscribeUrl: `${EMAIL_CONFIG.COMPANY_URL}/unsubscribe`
  });
};

export const sendQRCodeReady = async (customerEmail: string, qrData: any) => {
  return sendEmail(customerEmail, 'QR_CODE_READY', {
    downloadUrl: qrData.downloadUrl,
    supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL
  });
};
