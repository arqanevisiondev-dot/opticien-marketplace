import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmailNotification } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

// Subject translations
const subjectLabels: Record<string, string> = {
  information: 'Demande d\'information',
  order: 'Commande',
  account: 'Compte',
  partnership: 'Partenariat',
  other: 'Autre',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Log the contact form submission
    console.log('Contact form submission:', validatedData);

    // Fetch all admin users from the database
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        email: true,
      },
    });

    if (adminUsers.length === 0) {
      console.warn('⚠️ No admin users found in database');
      return NextResponse.json(
        { 
          success: true,
          message: 'Votre message a été enregistré' 
        },
        { status: 200 }
      );
    }

    console.log(`📧 Found ${adminUsers.length} admin(s):`, adminUsers.map(a => a.email));

    // Build email HTML for admin
    const subjectLabel = subjectLabels[validatedData.subject] || validatedData.subject;
    
    const adminEmailHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(135deg, #2C3B4D 0%, #1B2632 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📬 Nouveau message de contact</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2C3B4D; margin: 0 0 15px 0; font-size: 18px;">Informations du contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 30%;">Nom :</td>
                <td style="padding: 8px 0; color: #111827;">${validatedData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email :</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${validatedData.email}" style="color: #3b82f6; text-decoration: none;">
                    ${validatedData.email}
                  </a>
                </td>
              </tr>
              ${validatedData.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Téléphone :</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${validatedData.phone}" style="color: #3b82f6; text-decoration: none;">
                    ${validatedData.phone}
                  </a>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Sujet :</td>
                <td style="padding: 8px 0;">
                  <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 14px;">
                    ${subjectLabel}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #fefce8; border-left: 4px solid #facc15; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #854d0e; margin: 0 0 10px 0; font-size: 16px;">💬 Message</h3>
            <p style="color: #713f12; margin: 0; white-space: pre-wrap; line-height: 1.6;">
              ${validatedData.message}
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <a href="mailto:${validatedData.email}" 
               style="display: inline-block; background: #f56a24; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 10px;">
              ✉️ Répondre par email
            </a>
            ${validatedData.phone ? `
            <a href="tel:${validatedData.phone}" 
               style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              📞 Appeler
            </a>
            ` : ''}
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">
            Ce message a été envoyé depuis le formulaire de contact de <strong>Arqane Vision</strong>
          </p>
          <p style="margin: 5px 0 0 0;">
            ${new Date().toLocaleString('fr-FR', { 
              dateStyle: 'full', 
              timeStyle: 'short',
              timeZone: 'Africa/Casablanca'
            })}
          </p>
        </div>
      </div>
    `;

    const emailSubject = `📬 Nouveau message de ${validatedData.name} - ${subjectLabel}`;

    // Send email to all admins
    let successCount = 0;
    let failCount = 0;

    for (const admin of adminUsers) {
      try {
        const sent = await sendEmailNotification(
          admin.email,
          emailSubject,
          adminEmailHtml
        );

        if (sent) {
          console.log(`✅ Email sent to admin: ${admin.email}`);
          successCount++;
        } else {
          console.error(`❌ Failed to send email to admin: ${admin.email}`);
          failCount++;
        }
      } catch (error) {
        console.error(`❌ Error sending email to admin ${admin.email}:`, error);
        failCount++;
      }
    }

    console.log(`📊 Email summary: ${successCount} sent, ${failCount} failed out of ${adminUsers.length} admins`);

    // Always return success to user even if email fails
    return NextResponse.json(
      { 
        success: true,
        message: 'Votre message a été envoyé avec succès' 
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Données invalides' },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}