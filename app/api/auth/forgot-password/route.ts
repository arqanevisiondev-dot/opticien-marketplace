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
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     resetToken,
    //     resetTokenExpiry,
    //   },
    // });

    // Send email with reset link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    // For now, just log it (in production, send actual email)
    console.log('Password reset requested for:', email);
    // console.log('Reset URL:', resetUrl);

    // TODO: Send email using nodemailer
    // const { sendEmailWithNodemailer } = await import('@/lib/email');
    // await sendEmailWithNodemailer(
    //   email,
    //   'Réinitialisation de mot de passe',
    //   `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`
    // );

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
