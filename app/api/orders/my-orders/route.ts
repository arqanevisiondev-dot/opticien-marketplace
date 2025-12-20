import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "OPTICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { optician: true },
    })

    if (!user || !user.optician) {
      return NextResponse.json({ error: "Optician not found" }, { status: 404 })
    }


    const orders = await prisma.order.findMany({
      where: {
        opticianId: user.optician.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Parse `product.images` (stored as JSON string) into an array for each order item
    const formatted = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const prod = item.product
        if (!prod) return item

        let images: string[] = []
        try {
          images = Array.isArray((prod as unknown as { images: unknown }).images)
            ? ((prod as unknown as { images: string[] }).images)
            : JSON.parse(prod.images || '[]')
        } catch (e) {
          images = []
        }

        return {
          ...item,
          product: {
            ...prod,
            images,
          },
        }
      }),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching orders:", error)
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
