import { NextResponse } from 'next/server';
import { sendEmailNotification, sendEmailWithNodemailer } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order, items, subtotal, deliveryCost, total, user, loyaltyItems, totalPoints } = body;

    // Build a simple, sweet HTML email for admin (includes loyalty items if provided)
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || process.env.ADMIN_URL || process.env.BASE_URL || '';
    const html = buildOrderEmailHtml({ order, items, subtotal, deliveryCost, total, user, loyaltyItems, totalPoints, adminBase });

    // Fetch admin users from database
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, businessName: true },
    });

    if (!admins || admins.length === 0) {
      console.warn('No admin users found in database');
      return NextResponse.json({ ok: false, error: 'No admin users found' }, { status: 500 });
    }

    // Send email to each admin. Try Resend first, fallback to SMTP per admin.
    const results: Array<{ email: string; ok: boolean; error?: string }> = [];
    for (const a of admins) {
      const to = a.email;
      let ok = false;
      try {
        ok = await sendEmailNotification(to, `Nouvelle commande depuis la marketplace`, html);
        if (!ok) {
          console.warn(`Resend didn't send to ${to}, trying SMTP fallback`);
          ok = await sendEmailWithNodemailer(to, `Nouvelle commande depuis la marketplace`, html);
        }
      } catch (err) {
        console.error(`Error sending email to ${to} via Resend, trying SMTP:`, err);
        try {
          ok = await sendEmailWithNodemailer(to, `Nouvelle commande depuis la marketplace`, html);
        } catch (err2) {
          console.error(`SMTP fallback failed for ${to}:`, err2);
          results.push({ email: to, ok: false, error: String(err2) });
          continue;
        }
      }

      if (ok) results.push({ email: to, ok: true });
      else results.push({ email: to, ok: false, error: 'Unknown send failure' });
    }

    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      console.error('Some admin emails failed to send:', failed);
      return NextResponse.json({ ok: false, error: 'Some admin emails failed', details: failed }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in email-order route:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

function escapeHtml(str: any) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildOrderEmailHtml({ order, items, subtotal, deliveryCost, total, user, loyaltyItems, totalPoints, adminBase }: any) {
  const rows = (items || [])
    .map((it: any) => {
      const name = escapeHtml(it.productName || it.name || it.productReference || it.productId);
      const qty = it.quantity || 0;
      const unit = (Number(it.salePrice || it.unitPrice || 0)).toFixed(2);
      const line = (Number(it.totalLine || (qty * (Number(it.salePrice || it.unitPrice || 0)))) || 0).toFixed(2);
      const thumb = it.imageUrl ? `<img src="${escapeHtml(it.imageUrl)}" alt="${name}" style="width:56px;height:56px;object-fit:cover;border-radius:6px;margin-right:8px;border:1px solid #eee" />` : '';
      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f3f3f3;vertical-align:middle">
            <div style="display:flex;align-items:center">
              ${thumb}
              <div style="font-size:14px;color:#333">
                <div style="font-weight:600">${name}</div>
                <div style="font-size:12px;color:#777">Quantité: ${qty} • Prix unité: ${unit} DH</div>
              </div>
            </div>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f3f3f3;text-align:right;vertical-align:middle;font-weight:600">${line} DH</td>
        </tr>`;
    })
    .join('');

  const loyaltyRows = (loyaltyItems || [])
    .map((li: any) => {
      const name = escapeHtml(li.name || li.productName || li.productId || 'Produit fidélité');
      const qty = li.quantity || 0;
      const pointsPer = li.pointsCost || li.pointsPerUnit || 0;
      const totalPts = (qty * pointsPer) || 0;
      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #f3f3f3;font-size:14px">${name} × ${qty}</td>
          <td style="padding:10px;border-bottom:1px solid #f3f3f3;text-align:right;font-weight:600">${totalPts} pts</td>
        </tr>`;
    })
    .join('');

  const userInfo = user ? `
    <div style="padding:8px 0">
      <div style="font-size:14px;font-weight:700;color:#333">${escapeHtml(user.businessName || user.email || '')}</div>
      <div style="font-size:13px;color:#666">${escapeHtml(user.email || '')}</div>
    </div>
  ` : '';

  const orderIdLine = order && order.id ? `<div style="font-size:12px;color:#777">Order ID: ${escapeHtml(order.id)}</div>` : '';
  const orderDateLine = order && order.createdAt ? `<div style="font-size:12px;color:#777">Date: ${escapeHtml(new Date(order.createdAt).toLocaleString())}</div>` : '';

  const adminLink = adminBase ? `${adminBase.replace(/\/$/, '')}/admin/orders/${escapeHtml(order?.id || '')}` : '#';

  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#333;background:#f6f7f8;padding:20px">
    <div style="max-width:740px;margin:0 auto">
      <div style="background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eee">
        <div style="background:linear-gradient(90deg,#f56a24,#ff8345);padding:20px;color:#fff;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:10px;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-weight:700">OM</div>
            <div>
              <div style="font-size:18px;font-weight:700">Nouvelle commande reçue</div>
              <div style="font-size:13px;opacity:0.95">Une nouvelle commande a été passée depuis la marketplace</div>
            </div>
          </div>
          <div style="text-align:right;font-size:13px">${orderIdLine}${orderDateLine}</div>
        </div>

        <div style="padding:20px;display:flex;gap:20px">
          <div style="flex:1;min-width:220px">
            <div style="background:#fafafa;padding:12px;border-radius:8px;border:1px solid #f1f1f1">
              <div style="font-size:13px;color:#666">Optician</div>
              ${userInfo}
              <div style="height:8px"></div>
              <div style="font-size:13px;color:#666">Résumé financier</div>
              <div style="display:flex;justify-content:space-between;padding-top:8px;font-size:14px"><div>Sous-total</div><div style="font-weight:700">${Number(subtotal || 0).toFixed(2)} DH</div></div>
              <div style="display:flex;justify-content:space-between;padding-top:6px;font-size:14px"><div>Frais de livraison</div><div style="font-weight:700">${Number(deliveryCost || 0) === 0 ? 'Gratuit' : Number(deliveryCost).toFixed(2) + ' DH'}</div></div>
              <div style="border-top:1px dashed #eee;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#f56a24"><div>Total</div><div>${Number(total || 0).toFixed(2)} DH</div></div>
              ${loyaltyRows ? `<div style="margin-top:10px;font-size:13px;color:#666">Points totaux: <strong style="color:#333">${Number(totalPoints || 0)} pts</strong></div>` : ''}
            </div>
            <div style="margin-top:12px"><a href="${adminLink}" style="display:inline-block;padding:10px 14px;background:#2C3B4D;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Voir dans l'admin</a></div>
          </div>

          <div style="flex:2">
            <div style="font-size:15px;font-weight:700;margin-bottom:8px">Détails des produits</div>
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:6px;overflow:hidden">
              <thead style="background:#fafafa">
                <tr>
                  <th style="text-align:left;padding:12px;color:#666;font-weight:600">Produit</th>
                  <th style="text-align:center;padding:12px;color:#666;font-weight:600">Quantité</th>
                  <th style="text-align:right;padding:12px;color:#666;font-weight:600">Montant</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            ${loyaltyRows ? `
              <div style="margin-top:16px">
                <div style="font-size:15px;font-weight:700;margin-bottom:8px">Produits de fidélité</div>
                <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:6px;overflow:hidden">
                  <thead style="background:#fff">
                    <tr>
                      <th style="text-align:left;padding:10px;color:#666;font-weight:600">Produit</th>
                      <th style="text-align:right;padding:10px;color:#666;font-weight:600">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${loyaltyRows}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div style="margin-top:12px;font-size:13px;color:#777">Vous pouvez gérer cette commande depuis l'admin panel.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}
