import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmailNotification } from "@/lib/email"

type Body = {
  subject: string
  contentHtml: string
  recipientIds?: string[]
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function processAttachments(escapedContent: string, baseUrl: string): string {
  // Match escaped file paths like /uploads/filename.pdf in already-escaped HTML
  const filePathRegex = /\/uploads\/[^\s<>"]+\.(pdf|jpg|jpeg|png|doc|docx|xls|xlsx|zip)/gi

  return escapedContent.replace(filePathRegex, (filePath) => {
    const fullUrl = `${baseUrl}${filePath}`
    const fileName = filePath.split("/").pop() || "fichier"
    const fileExt = fileName.split(".").pop()?.toUpperCase() || "FILE"

    // Return proper HTML link (not escaped) to render as clickable button
    return `<a href="${fullUrl}" style="display:inline-block; margin:8px 0; padding:12px 20px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;" download>📎 Télécharger ${fileExt}</a>`
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const body = (await request.json()) as Body
    const { subject, contentHtml, recipientIds } = body

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 })
    }

    if (!contentHtml || typeof contentHtml !== "string" || contentHtml.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Fetch recipient opticians with user email
    let opticians
    if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      opticians = await prisma.optician.findMany({
        where: {
          id: { in: recipientIds },
        },
        select: {
          id: true,
          businessName: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      })
    } else {
      opticians = await prisma.optician.findMany({
        select: {
          id: true,
          businessName: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    const recipients = opticians
      .filter((o) => o.user?.email)
      .map((o) => ({
        id: o.id,
        email: o.user.email!,
        firstName: o.firstName,
        lastName: o.lastName,
      }))

    if (recipients.length === 0) {
      return NextResponse.json({ error: "Aucun destinataire email trouvé" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

      const concurrency = 10
      let success = 0
      let failed = 0
      const results: Array<{ email: string; ok: boolean; error?: string }> = []

      // Helper to pause between sends (ms)
      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

      for (let i = 0; i < recipients.length; i += concurrency) {
        const chunk = recipients.slice(i, i + concurrency)

        // Process each recipient sequentially within the chunk, with a delay
        for (const r of chunk) {
          try {
            const preview = escapeHtml(contentHtml).slice(0, 120)
            const safeContent = escapeHtml(contentHtml).replace(/\n/g, "<br />")

            const htmlContent = `
              <!doctype html>
              <html>
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body style="margin:0;padding:0;background-color:#f3f6f9;font-family:Helvetica,Arial,sans-serif;">
                <span style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preview}</span>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding:28px 16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 18px rgba(20,20,30,0.06);">
                        <tr>
                          <td style="background:#0b74de; padding:20px 24px; color:#ffffff;">
                            <h1 style="margin:0; font-size:20px; font-weight:600;">${escapeHtml(subject)}</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:24px; color:#0f1724; font-size:15px; line-height:1.6;">
                            <p style="margin:0 0 12px 0;">Bonjour ${escapeHtml(r.firstName || '')} ${escapeHtml(r.lastName || '')},</p>
                            <div style="background:#ffffff; border:1px solid #eef2f7; border-radius:6px; padding:16px;">
                              <div style="white-space:pre-wrap;">${safeContent}</div>
                            </div>
                            <p style="margin:18px 0 0 0; color:#6b7280; font-size:13px">Merci,<br/>L'Arqane Vision</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#fbfdff; padding:16px 24px; font-size:12px; color:#9ca3af;">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap; gap:8px;">
                              <div>Vous recevez cet e-mail car vous êtes inscrit en tant qu'opticien.</div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `

            const ok = await sendEmailNotification(r.email, subject, htmlContent)
            if (ok === true) {
              success += 1
              results.push({ email: r.email, ok: true })
            } else {
              failed += 1
              results.push({ email: r.email, ok: false, error: 'send failed' })
            }
          } catch (err) {
            failed += 1
            results.push({ email: r.email, ok: false, error: String(err) })
          }

          // Respect rate limit: wait 2 seconds between sends
          await sleep(2000)
        }
    }

    // Record campaign in DB
    try {
      await prisma.emailCampaign.create({
        data: {
          creatorId: session.user!.id,
          subject,
          content: contentHtml,
          targetRole: "OPTICIAN",
          recipients: recipients.length,
        },
      })
    } catch (err) {
      console.error("Failed to record EmailCampaign:", err)
    }

    return NextResponse.json({
      success,
      failed,
      attempted: recipients.length,
      results,
    })
  } catch (error) {
    console.error("Error sending email campaign:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi de la campagne" }, { status: 500 })
  }
}
