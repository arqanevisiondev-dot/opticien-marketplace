import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email as string | undefined
    if (!email) {
      return NextResponse.json({ error: 'MISSING_EMAIL' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { optician: true },
    })

    if (!user) {
      return NextResponse.json({ status: 'NO_USER' })
    }

    if (!user.optician) {
      return NextResponse.json({ status: 'NOT_OPTICIAN' })
    }

    return NextResponse.json({ status: user.optician.status })
  } catch (err) {
    console.error('check-status error', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
