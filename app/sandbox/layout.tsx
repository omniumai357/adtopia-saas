import React from 'react';

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sandbox Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                🧪 AdTopia Sandbox
              </h1>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                TESTING
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Main Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
