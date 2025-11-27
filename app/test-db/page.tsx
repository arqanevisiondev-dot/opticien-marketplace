import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export default async function TestDbPage() {
  const dbUrl = process.env.DATABASE_URL || '';
  let host = '';
  let database = '';
  try {
    if (dbUrl) {
      const u = new URL(dbUrl);
      host = u.hostname + (u.port ? `:${u.port}` : '');
      database = u.pathname.replace(/^\//, '');
    }
  } catch {}

  let pingOk = false;
  let pingError: string | null = null;
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    pingOk = true;
  } catch (e) {
    pingError = e instanceof Error ? e.message : String(e);
  }

  let counts: {
    users: number;
    suppliers: number;
    products: number;
    categories: number;
  } | null = null;

  if (pingOk) {
    try {
      const [users, opticians, products, categories] = await Promise.all([
        prisma.user.count(),
        prisma.optician.count(),
        prisma.product.count(),
        prisma.category.count(),
      ]);
      counts = { users, suppliers: opticians, products, categories };
    } catch (e) {
      pingOk = false;
      pingError = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-abyssal mb-6">DB Connection Test</h1>
        <div className="bg-white shadow p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-600">NODE_ENV</div>
            <div className="font-mono">{process.env.NODE_ENV}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">DATABASE_URL present</div>
            <div className="font-mono">{dbUrl ? 'yes' : 'no'}</div>
          </div>
          {dbUrl && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">DB Host</div>
                <div className="font-mono break-all">{host || 'unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">DB Name</div>
                <div className="font-mono break-all">{database || 'unknown'}</div>
              </div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">Ping</div>
            <div className={pingOk ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {pingOk ? 'OK' : 'FAILED'}
            </div>
          </div>
          {!pingOk && pingError && (
            <div>
              <div className="text-sm text-gray-600">Error</div>
              <pre className="bg-gray-100 p-3 overflow-auto text-sm text-red-700 border border-red-200">
                {pingError}
              </pre>
            </div>
          )}
          {counts && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Row counts</div>
              <ul className="list-disc ml-6 space-y-1">
                <li className="font-mono">users: {counts.users}</li>
                <li className="font-mono">suppliers: {counts.suppliers}</li>
                <li className="font-mono">products: {counts.products}</li>
                <li className="font-mono">categories: {counts.categories}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
