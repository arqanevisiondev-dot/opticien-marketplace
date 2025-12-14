import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public read-only settings endpoint for non-sensitive site settings
export async function GET() {
  try {
    // Only expose keys that are safe for public consumption
    const allowedKeys = [
      'contact_email',
      'contact_phone',
      'contact_address',
      'contact_whatsapp',
    ];

    const settings = await prisma.systemSettings.findMany({
      where: { key: { in: allowedKeys } },
    });

    const result: Record<string, string> = {};
    settings.forEach((s) => (result[s.key] = s.value));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
