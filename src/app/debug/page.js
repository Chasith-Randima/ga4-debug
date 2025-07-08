'use client';

import { useState, useEffect } from 'react';

export default function DebugDashboard() {
  const [debugRecords, setDebugRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/debug-data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch debug data');
      }
      
      const data = await response.json();
      setDebugRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            GA4 Debug Dashboard
          </h1>
          <button
            onClick={fetchDebugData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading debug data...</span>
          </div>
        ) : debugRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No debug records found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Records List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Debug Records ({debugRecords.length})
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {debugRecords.map((record, index) => (
                    <div
                      key={record._id}
                      onClick={() => setSelectedRecord(record)}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRecord?._id === record._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            Order: {record.orderData?.orderId || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(record.timestamp)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-1">
                          {record.browserData?.browser?.name || 'Unknown'}
                        </span>
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-1">
                          {record.browserData?.os?.name || 'Unknown'}
                        </span>
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                          {record.browserData?.privateMode?.isPrivateMode ? '🔒' : '🌐'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-1">
                          GA4: {record.ga4Data?.gtag === 'available' ? '✅' : '❌'}
                        </span>
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-1">
                          GTM: {record.gtmData?.gtm === 'available' ? '✅' : '❌'}
                        </span>
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                          AdBlock: {record.browserData?.adBlockers?.adBlockDetected ? '🚫' : '✅'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Record Details */}
            <div className="lg:col-span-2">
              {selectedRecord ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Record Details
                    </h2>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Order Data */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Order Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Order ID:</span> {selectedRecord.orderData?.orderId || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Order Date:</span> {selectedRecord.orderData?.orderDate || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> {selectedRecord.orderData?.orderTotal || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Customer:</span> {selectedRecord.orderData?.customerInfo?.name || 'N/A'}
                          </div>
                        </div>
                        {selectedRecord.orderData?.orderItems?.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Items:</span>
                            <ul className="mt-1 space-y-1">
                              {selectedRecord.orderData.orderItems.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  {item.name} - {item.total}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Browser & OS Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Browser & OS Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Browser:</span> {selectedRecord.browserData?.browser?.name} {selectedRecord.browserData?.browser?.version}
                          </div>
                          <div>
                            <span className="font-medium">OS:</span> {selectedRecord.browserData?.os?.name} {selectedRecord.browserData?.os?.version}
                          </div>
                          <div>
                            <span className="font-medium">Device Type:</span> 
                            {selectedRecord.browserData?.browser?.isMobile ? 'Mobile' : 
                             selectedRecord.browserData?.browser?.isTablet ? 'Tablet' : 'Desktop'}
                          </div>
                          <div>
                            <span className="font-medium">IP Address:</span> {selectedRecord.browserData?.ipAddress?.ip || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">Private Mode:</span> 
                            {selectedRecord.browserData?.privateMode?.isPrivateMode ? 
                              `Yes (${Math.round(selectedRecord.browserData?.privateMode?.confidence)}% confidence)` : 'No'}
                          </div>
                          <div>
                            <span className="font-medium">Screen:</span> {selectedRecord.browserData?.screenWidth} x {selectedRecord.browserData?.screenHeight}
                          </div>
                          <div>
                            <span className="font-medium">Window:</span> {selectedRecord.browserData?.windowWidth} x {selectedRecord.browserData?.windowHeight}
                          </div>
                          <div>
                            <span className="font-medium">Language:</span> {selectedRecord.browserData?.language}
                          </div>
                          <div>
                            <span className="font-medium">Timezone:</span> {selectedRecord.browserData?.timezone}
                          </div>
                          <div>
                            <span className="font-medium">Page Load Time:</span> {selectedRecord.browserData?.pageLoadTime}ms
                          </div>
                          <div>
                            <span className="font-medium">Connection:</span> {selectedRecord.browserData?.connection?.effectiveType || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Privacy & Ad Blocker Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Privacy & Ad Blocker Detection</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Ad Blocker Detected:</span> 
                            {selectedRecord.browserData?.adBlockers?.adBlockDetected ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <span className="font-medium">Do Not Track:</span> {selectedRecord.browserData?.doNotTrack || 'Not set'}
                          </div>
                          <div>
                            <span className="font-medium">Hardware Concurrency:</span> {selectedRecord.browserData?.hardwareConcurrency || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">Device Memory:</span> {selectedRecord.browserData?.deviceMemory || 'Unknown'} GB
                          </div>
                        </div>
                        
                        {selectedRecord.browserData?.adBlockers?.privacyExtensions?.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Privacy Extensions Detected:</span>
                            <ul className="mt-1 space-y-1">
                              {selectedRecord.browserData.adBlockers.privacyExtensions.map((ext, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  • {ext}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {selectedRecord.browserData?.adBlockers?.blockedElements?.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Blocked Elements:</span>
                            <div className="mt-1 text-xs text-gray-600">
                              {selectedRecord.browserData.adBlockers.blockedElements.slice(0, 3).join(', ')}
                              {selectedRecord.browserData.adBlockers.blockedElements.length > 3 && '...'}
                            </div>
                          </div>
                        )}
                        
                        {selectedRecord.browserData?.adBlockers?.blockedScripts?.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Blocked Scripts:</span>
                            <ul className="mt-1 space-y-1">
                              {selectedRecord.browserData.adBlockers.blockedScripts.map((script, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  • {script}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GA4 Data */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">GA4 Tracking</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">GTAG Available:</span> {selectedRecord.ga4Data?.gtag}
                          </div>
                          <div>
                            <span className="font-medium">Client ID:</span> {selectedRecord.ga4Data?.clientId || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Events Count:</span> {selectedRecord.ga4Data?.ga4Events?.length || 0}
                          </div>
                        </div>
                        {selectedRecord.ga4Data?.ga4Events?.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Recent Events:</span>
                            <div className="mt-2 max-h-32 overflow-y-auto">
                              {selectedRecord.ga4Data.ga4Events.map((event, index) => (
                                <div key={index} className="text-xs bg-white p-2 rounded mb-1">
                                  {event.event}: {JSON.stringify(event)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GTM Data */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">GTM Tracking</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">GTM Available:</span> {selectedRecord.gtmData?.gtm}
                          </div>
                          <div>
                            <span className="font-medium">Container ID:</span> {selectedRecord.gtmData?.containerId || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Events Count:</span> {selectedRecord.gtmData?.gtmEvents?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stape Data */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Stape.io Tracking</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Stape Available:</span> {selectedRecord.stapeData?.stape}
                          </div>
                          <div>
                            <span className="font-medium">Scripts Count:</span> {selectedRecord.stapeData?.scripts?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Raw Data */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Raw Data</h3>
                      <details className="bg-gray-50 p-4 rounded-lg">
                        <summary className="cursor-pointer font-medium">Click to view raw JSON</summary>
                        <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded">
                          {formatJson(selectedRecord)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
                  <p className="text-gray-500">Select a record to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 