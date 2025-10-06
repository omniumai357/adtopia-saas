'use client';

import { useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  stripeLink: string;
  status: 'active' | 'inactive';
};

export default function ProductsPage() {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Preview Package',
      price: 29,
      description: '7-day live preview with QR code generation',
      stripeLink: 'https://buy.stripe.com/[PRODUCT_ID_PREVIEW]',
      status: 'active'
    },
    {
      id: '2',
      name: 'Full Package',
      price: 297,
      description: 'Complete setup + 3 months support',
      stripeLink: 'https://buy.stripe.com/[PRODUCT_ID_FULL]',
      status: 'active'
    },
    {
      id: '3',
      name: 'Translation Add-on',
      price: 29,
      description: 'Bilingual support for your QR codes',
      stripeLink: 'https://buy.stripe.com/[PRODUCT_ID_TRANSLATION]',
      status: 'active'
    },
    {
      id: '4',
      name: 'Domain + SSL',
      price: 49,
      description: 'Custom domain with SSL certificate',
      stripeLink: 'https://buy.stripe.com/[PRODUCT_ID_DOMAIN_SSL]',
      status: 'active'
    },
    {
      id: '5',
      name: 'Extra Cards',
      price: 39,
      description: 'Additional custom ad cards',
      stripeLink: 'https://buy.stripe.com/[PRODUCT_ID_EXTRA_CARDS]',
      status: 'active'
    }
  ]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Saving product:', editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Product Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stripe Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a 
                    href={product.stripeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View in Stripe
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stripe Link</label>
                  <input
                    type="url"
                    value={editingProduct.stripeLink}
                    onChange={(e) => setEditingProduct({...editingProduct, stripeLink: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Status Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Product Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-500">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${products.reduce((sum, p) => sum + p.price, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
}
