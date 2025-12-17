import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    return null;
  }

  try {
    console.log('🔧 Initializing Resend client with API key:', apiKey.substring(0, 10) + '...');
    const client = new Resend(apiKey);
    console.log('✅ Resend client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Resend client:', error);
    return null;
  }
}

/**
 * Send email using Resend (primary and only method)
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    console.log('📨 [sendEmailNotification] Called with:', { to, subject });
    
    const emailFrom = process.env.EMAIL_FROM;
    console.log('📧 EMAIL_FROM:', emailFrom);

    if (!emailFrom) {
      console.error('❌ EMAIL_FROM not configured');
      return false;
    }

    // Check if Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY;
    console.log('🔑 RESEND_API_KEY configured:', !!apiKey);
    
    if (!apiKey) {
      console.error('❌ Resend API key not configured');
      return false;
    }

    console.log('🚀 Getting Resend client...');
    const resend = getResendClient();
    
    if (!resend) {
      console.error('❌ Failed to initialize Resend client');
      return false;
    }

    console.log(`📧 Sending email via Resend to ${to} from ${emailFrom}`);
    const response = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log('📬 Resend response:', response);

    if (response.error) {
      console.error('❌ Resend error:', response.error);
      console.error('⚠️  Error details:', response.error.message);
      return false;
    }

    console.log('✅ Email sent via Resend:', response.data?.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    return false;
  }
}

/**
 * Alias for backward compatibility (still use Resend, not SMTP)
 */
export async function sendEmailWithNodemailer(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  // Just call the Resend method
  return sendEmailNotification(to, subject, html);
}
