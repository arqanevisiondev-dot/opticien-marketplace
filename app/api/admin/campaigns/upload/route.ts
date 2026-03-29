import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"
import crypto from "crypto"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate allowed types and set size limits
    const mime = (file as any).type || ''
    const isImage = mime.startsWith('image/')
    const isVideo = mime.startsWith('video/')
    const isPdf = mime === 'application/pdf'

    if (!isImage && !isVideo && !isPdf) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // File limits: images & pdfs 5 MB, videos 50 MB
    const MAX_BYTES = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (typeof (file as any).size === 'number' && (file as any).size > MAX_BYTES) {
      return NextResponse.json({ error: `File too large (max ${isVideo ? '50' : '5'} MB)` }, { status: 400 })
    }

    const originalName = (file as any).name || "upload"
    const ext = path.extname(originalName) || ""
    const filename = `campaigns/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ url: blob.url, filename, size: (file as any).size, type: file.type })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
