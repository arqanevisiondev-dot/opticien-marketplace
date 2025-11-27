import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Le sujet est requis'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Log the contact form submission
    console.log('Contact form submission:', validatedData);

    // TODO: Send email to admin
    // const { sendEmailWithNodemailer } = await import('@/lib/email');
    // await sendEmailWithNodemailer(
    //   'contact@arqanevision.com',
    //   `Nouveau message: ${validatedData.subject}`,
    //   `
    //     <h2>Nouveau message de contact</h2>
    //     <p><strong>Nom:</strong> ${validatedData.name}</p>
    //     <p><strong>Email:</strong> ${validatedData.email}</p>
    //     <p><strong>Téléphone:</strong> ${validatedData.phone || 'Non fourni'}</p>
    //     <p><strong>Sujet:</strong> ${validatedData.subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${validatedData.message}</p>
    //   `
    // );

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
