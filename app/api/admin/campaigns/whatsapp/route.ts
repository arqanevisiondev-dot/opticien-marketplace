import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { message, recipientIds } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

    if (!token || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Configuration WhatsApp manquante. Définissez WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID' },
        { status: 500 }
      );
    }

    type Recipient = { id: string; whatsapp: string };
    const isValidRecipient = (r: { id: string; whatsapp: string | null }): r is Recipient =>
      typeof r.whatsapp === 'string' && r.whatsapp.length > 0;
    let recipients: Recipient[] = [];

    if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      const list = await prisma.optician.findMany({
        where: {
          id: { in: recipientIds },
          AND: [
            { whatsapp: { not: null } },
            { whatsapp: { not: '' } },
          ],
        },
        select: { id: true, whatsapp: true },
      });
      recipients = list
        .filter(isValidRecipient)
        .map(({ id, whatsapp }: Recipient) => ({ id, whatsapp }));
    } else {
      const list = await prisma.optician.findMany({
        where: {
          AND: [
            { whatsapp: { not: null } },
            { whatsapp: { not: '' } },
          ],
        },
        select: { id: true, whatsapp: true },
      });
      recipients = list
        .filter(isValidRecipient)
        .map(({ id, whatsapp }: Recipient) => ({ id, whatsapp }));
    }

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    type SendResult = { id: string; to: string; data: unknown };
    type SendError = { status?: number; data?: unknown };

    const results = await Promise.allSettled<SendResult>(
      recipients.map(async (r) => {
        const payload = {
          messaging_product: 'whatsapp',
          to: r.whatsapp,
          type: 'text',
          text: { body: message },
        } as const;

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw { status: res.status, data };
        }
        return { id: r.id, to: r.whatsapp, data };
      })
    );

    const summary = {
      success: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results: results.map((r) =>
        r.status === 'fulfilled'
          ? { ok: true as const, ...r.value }
          : { ok: false as const, error: r.reason as SendError }
      ),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error sending WhatsApp broadcast:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message WhatsApp" },
      { status: 500 }
    );
  }
}
