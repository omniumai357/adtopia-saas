import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                AdTopia Admin
              </Link>
              <nav className="flex space-x-6">
                <Link 
                  href="/admin" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/stripe-logs" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Stripe Logs
                </Link>
                <Link 
                  href="/admin/products" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Products
                </Link>
                    <Link 
                      href="/admin/analytics" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Analytics
                    </Link>
                    <Link 
                      href="/admin/roles" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Roles
                    </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Panel</span>
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
