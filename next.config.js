/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['adtopia-saas-2ulgwy3xb-omnia-group.vercel.app', 'vercel.app', 'supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig
