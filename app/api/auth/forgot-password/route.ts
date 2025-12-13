import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe, un email a été envoyé',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database (you would need to add these fields to your User model)
    // Save token to database so the reset page can validate the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Build reset URL (token should be saved to DB in a real implementation)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Send email using nodemailer helper. If you haven't saved the token to the DB
    // the link will still contain a token but won't be validated server-side.
    try {
      const { sendEmailWithNodemailer } = await import('@/lib/email');

      const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#222">
          <h2 style="color:#2C3B4D">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Arqane Vision.</p>
          <p style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="background:#f56a24;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Réinitialiser mon mot de passe</a>
          </p>
          <p>${resetUrl}</p>
          <p style="color:#666;font-size:14px">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email ou contactez notre support.</p>
          <p style="margin-top:24px;color:#444">Cordialement,<br/>Arqane Vision</p>
        </div>
      `;

      const subject = 'Réinitialisation de votre mot de passe — Arqane Vision';

      const sent = await sendEmailWithNodemailer(email, subject, html);

      if (sent) console.log('Password reset email sent to:', email);
      else console.error('Failed to send password reset email to:', email);
    } catch (err) {
      console.error('Error sending reset email:', err);
    }

    // Also log the request for debugging
    console.log('Password reset requested for:', email);
    console.log('Reset URL (for debugging):', resetUrl);

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe, un email a été envoyé',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
