'use client'

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

export default function CartBar() {
  const { items, clear, remove, increase, decrease } = useCart();
  const { data: session } = useSession();
  const isOptician = session?.user?.role === 'OPTICIAN';
  const businessName = (session?.user as unknown as { opticianBusinessName?: string })?.opticianBusinessName;
  const [fetchedBusinessName, setFetchedBusinessName] = useState<string | undefined>(undefined);
  useEffect(() => {
    let active = true;
    if (isOptician) {
      fetch('/api/me/optician')
        .then((r) => (r.ok ? r.json() : { businessName: null }))
        .then((data: { businessName?: string | null }) => {
          if (!active) return;
          if (data && typeof data.businessName === 'string' && data.businessName.trim()) {
            setFetchedBusinessName(data.businessName);
          } else if (businessName) {
            setFetchedBusinessName(businessName);
          }
        })
        .catch(() => {
          if (active && businessName) setFetchedBusinessName(businessName);
        });
    } else {
      setFetchedBusinessName(undefined);
    }
    return () => {
      active = false;
    };
  }, [isOptician, businessName]);
  const [open, setOpen] = useState(false);

  const adminWhats = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '';
  const adminWhatsDigits = adminWhats.replace(/[^0-9]/g, '');

  const waLink = useMemo(() => {
    if (!items.length || !adminWhatsDigits) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const lines = items.map((i, idx) => {
      const url = i.url?.startsWith('http') ? i.url : `${origin}${i.url ?? ''}`;
      return `${idx + 1}. ${i.name} (ref: ${i.reference}) x ${i.quantity}${url ? ` - ${url}` : ''}`;
    });
    const total = items.reduce((sum, it) => sum + it.quantity, 0);
    const header = `Bonjour, je suis ${fetchedBusinessName || businessName || 'opticien'} et je souhaite ces ${total} produits:`;
    const text = `${header}\n\n${lines.join('\n')}`;
    return `https://wa.me/${adminWhatsDigits}?text=${encodeURIComponent(text)}`;
  }, [items, adminWhatsDigits, businessName, fetchedBusinessName]);

  if (!isOptician) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white shadow-xl border border-gray-200 rounded-full px-4 py-2 flex items-center gap-3">
        <button className="text-sm underline" onClick={() => setOpen((v) => !v)}>
          {open ? 'Fermer' : 'Détails'}
        </button>
        <div className="text-sm">Sélection: <span className="font-semibold">{items.length}</span></div>
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={!items.length}
        >
          Vider
        </Button>
        <a
          href={waLink || undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { if (!waLink) e.preventDefault(); }}
        >
          <Button variant="primary" size="sm" disabled={!items.length || !adminWhatsDigits}>
            Contacter via WhatsApp
          </Button>
        </a>
      </div>
      {open && (
        <div className="mt-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 max-w-[90vw] w-[640px]">
          <div className="max-h-60 overflow-auto space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-gray-500">Aucun produit sélectionné.</div>
            ) : (
              items.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-gray-500">ref: {i.reference}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => decrease(i.id)}>-</Button>
                    <div className="w-8 text-center">{i.quantity}</div>
                    <Button variant="outline" size="sm" onClick={() => increase(i.id)}>+</Button>
                    <Button variant="outline" size="sm" onClick={() => remove(i.id)}>Supprimer</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {!adminWhatsDigits && (
        <div className="mt-2 text-center text-xs text-red-600">
          NEXT_PUBLIC_ADMIN_WHATSAPP non configuré
        </div>
      )}
    </div>
  );
}
