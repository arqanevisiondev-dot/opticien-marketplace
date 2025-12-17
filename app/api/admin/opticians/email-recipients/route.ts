// app/api/admin/opticians/email-recipients/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch all opticians with their user data
    const opticians = await prisma.optician.findMany({
      select: {
        id: true,
        businessName: true,
        firstName: true,
        lastName: true,
        status: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Filter out opticians without email and transform data
    const recipients = opticians
      .filter(optician => optician.user?.email)
      .map(optician => ({
        id: optician.id,
        email: optician.user.email,
        firstName: optician.firstName || "",
        lastName: optician.lastName || "",
        businessName: optician.businessName || `${optician.firstName} ${optician.lastName}`,
        status: optician.status
      }))

    return NextResponse.json(recipients)
  } catch (error) {
    console.error("Error fetching email recipients:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    )
  }
}