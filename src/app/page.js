'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/items');
      
      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.error === 'MongoDB not configured') {
            setApiAvailable(false);
            setError('Database not configured. This is a demo app.');
          } else {
            throw new Error('Failed to fetch items');
          }
        } else {
          throw new Error('Failed to fetch items');
        }
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in both name and description');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      // Reset form
      setFormData({ name: '', description: '' });
      
      // Refresh items list
      await fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Item Manager
        </h1>

        {!apiAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Demo Mode:</strong> This is a demo application. The database is not configured in production.
              You can still interact with the UI, but data won't be saved.
            </p>
          </div>
        )}

        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Item
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item description"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting || !apiAvailable}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : apiAvailable ? 'Add Item' : 'Demo Mode - No Database'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Items List
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading items...</span>
            </div>
          ) : !apiAvailable ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Demo Mode - No database connection</p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Sample Items (Demo)</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Sample Item 1</h3>
                    <p className="text-gray-600 mb-2">This is a sample item to demonstrate the UI</p>
                    <p className="text-sm text-gray-500">Created: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Sample Item 2</h3>
                    <p className="text-gray-600 mb-2">Another sample item for demonstration</p>
                    <p className="text-sm text-gray-500">Created: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items found. Add your first item above!</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <a 
            href="/test" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-4"
          >
            Test Page
          </a>
          <a 
            href="/debug" 
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mr-4"
          >
            Debug Dashboard
          </a>
          <a 
            href="/dummy-thank-you" 
            className="inline-block bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Dummy Thank You
          </a>
        </div>
      </div>
    </div>
  );
}
