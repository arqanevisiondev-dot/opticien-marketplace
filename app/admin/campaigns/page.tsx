'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Recipient {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  whatsapp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function WhatsappCampaignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    (async () => {
      const res = await fetch('/api/admin/opticians/whatsapp-recipients');
      if (res.ok) {
        const data = (await res.json()) as Recipient[];
        setRecipients(data);
        const init: Record<string, boolean> = {};
        data.forEach((r) => (init[r.id] = true));
        setSelected(init);
        setSelectAll(true);
      }
    })();
  }, [status, session, router]);

  const toggleAll = (checked: boolean) => {
    setSelectAll(checked);
    const next: Record<string, boolean> = {};
    recipients.forEach((r) => (next[r.id] = checked));
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const recipientIds = selectAll
        ? [] // server will default to all
        : Object.entries(selected)
            .filter(([, v]) => v)
            .map(([k]) => k);

      const res = await fetch('/api/admin/campaigns/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, recipientIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ success: data.success, failed: data.failed });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-abyssal mb-6">{t.whatsappCampaigns}</h1>

        <div className="bg-white p-6 shadow-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.message}</label>
          <textarea
            className="w-full border border-gray-300 p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
            placeholder={t.writeWhatsAppMessagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="selectAll"
                type="checkbox"
                className="h-4 w-4"
                checked={selectAll}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <label htmlFor="selectAll" className="text-sm text-gray-700">{t.selectAllOpticians}</label>
            </div>
            <Button variant="primary" onClick={handleSend} disabled={loading || !message.trim()}>
              {loading ? t.sending : t.sendViaWhatsApp}
            </Button>
          </div>
        </div>

        {!selectAll && (
          <div className="bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{t.recipients}</h2>
            <div className="max-h-80 overflow-auto divide-y divide-gray-100">
              {recipients.map((r) => (
                <label key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-abyssal">{r.businessName}</div>
                    <div className="text-sm text-gray-500">{r.firstName} {r.lastName} • {r.whatsapp}</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={!!selected[r.id]}
                    onChange={(e) => toggleOne(r.id, e.target.checked)}
                  />
                </label>
              ))}
              {recipients.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">{t.noOpticiansWithWhatsApp}</div>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-white p-4 shadow border border-gray-100">
            <div>{t.sentSuccessfully}: <span className="font-semibold text-green-600">{result.success}</span></div>
            <div>{t.failed}: <span className="font-semibold text-red-600">{result.failed}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
