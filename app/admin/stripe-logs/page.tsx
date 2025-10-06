'use client';

import { useEffect, useMemo, useState } from 'react';
// Dynamic import to avoid SSR issues

type LogRow = {
  id: string;
  project: string;
  stripe_product_id: string;
  name: string;
  price_usd: number;
  metadata: Record<string, any> | null;
  created_at: string;
};

export default function StripeLogsPage() {
  // Using existing Supabase client
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const filter = useMemo(() => {
    return { project, search, from, to };
  }, [project, search, from, to]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      
      // Mock data for now (until Supabase is properly configured)
      const mockData: LogRow[] = [];
      
      if (!active) return;
      
      // Simulate filtering
      const filtered = mockData.filter((r: LogRow) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          r.name?.toLowerCase()?.includes(s) ||
          r.stripe_product_id?.toLowerCase()?.includes(s)
        );
      });
      
      setRows(filtered);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [page, pageSize, filter]);

  const exportCsv = () => {
    const header = ['id','project','stripe_product_id','name','price_usd','created_at'];
    const lines = rows.map(r =>
      [r.id, r.project, r.stripe_product_id, r.name, r.price_usd, r.created_at]
        .map(v => `"${String(v ?? '').replace(/"/g,'""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `stripe_products_log_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Stripe Products Log</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="border px-3 py-2 rounded"
          placeholder="Project (e.g. adtopia, bizbox)"
          value={project}
          onChange={(e) => setProject(e.target.value.trim().toLowerCase())}
        />
        <input className="border px-3 py-2 rounded"
          placeholder="Search name or product id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input className="border px-3 py-2 rounded"
          type="datetime-local" value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input className="border px-3 py-2 rounded"
          type="datetime-local" value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="border px-3 py-2 rounded" onClick={() => { setPage(0); }}>Apply</button>
          <button className="border px-3 py-2 rounded" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Project</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Stripe Product ID</th>
              <th className="text-left p-2">Price (USD)</th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={5}>Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td className="p-3" colSpan={5}>No rows</td></tr>
          ) : rows.map(r => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-2 uppercase">{r.project}</td>
              <td className="p-2">{r.name}</td>
              <td className="p-2 font-mono">{r.stripe_product_id}</td>
              <td className="p-2">${Number(r.price_usd).toFixed(2)}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button className="border px-3 py-2 rounded"
          disabled={page===0}
          onClick={() => setPage(p => Math.max(0, p-1))}
        >Prev</button>
        <span>Page {page+1}</span>
        <button className="border px-3 py-2 rounded"
          onClick={() => setPage(p => p+1)}
        >Next</button>
      </div>
    </div>
  );
}
