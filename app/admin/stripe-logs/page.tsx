'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

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
  const supabase = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 25;

  const filter = useMemo(() => ({ project, search, from, to }), [project, search, from, to]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!supabase) {
          setError('Supabase client not available. Please check your environment configuration.');
          setRows([]);
          setLoading(false);
          return;
        }

        let query = supabase
          .from('stripe_products_log')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, page * pageSize + pageSize - 1);

        if (project) query = query.eq('project', project);
        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);

        const { data, error: queryError } = await query;
        
        if (!active) return;
        
        if (queryError) {
          console.error('Query error:', queryError);
          setError(`Database error: ${queryError.message}`);
          setRows([]);
        } else {
          // Client-side filtering for search
          const filtered = (data || []).filter((r: LogRow) => {
            if (!search) return true;
            const s = search.toLowerCase();
            return (
              r.name?.toLowerCase()?.includes(s) ||
              r.stripe_product_id?.toLowerCase()?.includes(s)
            );
          });
          setRows(filtered);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [supabase, page, pageSize, filter]);

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Stripe Products Log</h1>
        <div className="text-sm text-gray-500">
          {rows.length} {rows.length === 1 ? 'record' : 'records'} found
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input 
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Project (e.g. adtopia, bizbox)"
          value={project}
          onChange={(e) => setProject(e.target.value.trim().toLowerCase())}
        />
        <input 
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search name or product id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input 
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          type="datetime-local" 
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input 
          className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          type="datetime-local" 
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="flex gap-2">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            onClick={() => setPage(0)}
          >
            Apply
          </button>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="border rounded overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-900">Created</th>
              <th className="text-left p-3 font-medium text-gray-900">Project</th>
              <th className="text-left p-3 font-medium text-gray-900">Name</th>
              <th className="text-left p-3 font-medium text-gray-900">Stripe Product ID</th>
              <th className="text-left p-3 font-medium text-gray-900">Price (USD)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">No records found</p>
                    <p className="text-gray-500">Try adjusting your filters or create some products first.</p>
                  </div>
                </td>
              </tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-gray-900">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                    {r.project}
                  </span>
                </td>
                <td className="p-3 font-medium text-gray-900">{r.name}</td>
                <td className="p-3 font-mono text-sm text-gray-600">{r.stripe_product_id}</td>
                <td className="p-3 font-semibold text-gray-900">${Number(r.price_usd).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page + 1}</span>
          <button 
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={rows.length < pageSize}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, rows.length)} of {rows.length} results
        </div>
      </div>
    </div>
  );
}
