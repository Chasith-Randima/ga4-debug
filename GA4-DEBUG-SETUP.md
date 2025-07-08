# GA4 Debug System Setup Guide

## 🎯 Purpose
This system will help you debug why some GA4 purchase events are getting lost by collecting comprehensive data from your thank you page.

## 📋 What This System Collects

### 1. Order Data
- Order ID, date, total amount
- Customer information (name, email, phone, address)
- Order items and their details
- Payment method, discounts, shipping, tax

### 2. Browser Data
- User agent, screen resolution, window size
- Connection type and speed
- Page load performance metrics
- Timezone, language, cookies status
- Performance timing data

### 3. GA4 Tracking Data
- GA4 client ID
- Recent GA4 events in dataLayer
- GA4 cookies
- Purchase event details

### 4. GTM Data
- GTM container ID
- GTM events in dataLayer
- GTM script status

### 5. Stape.io Data
- Stape.io script detection
- Server-side tracking status

## 🚀 Implementation Steps

### Step 1: Deploy the Debug System

1. **Deploy to Vercel:**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Add GA4 debug system"
   git push origin main
   
   # Connect to Vercel and deploy
   # Add MONGODB_URI environment variable in Vercel
   ```

2. **Get your Vercel URL:**
   - Your app will be available at: `https://your-app-name.vercel.app`
   - Update the `DEBUG_API_URL` in the script below

### Step 2: Add Debug Script to Your Thank You Page

Add this script to your WordPress thank you page (`/checkout/order-received/`):

```html
<!-- GA4 Debug Script - Add this before closing </body> tag -->
<script>
// GA4 Debug Data Collection Script
(function() {
    'use strict';
    
    // ⚠️ UPDATE THIS URL TO YOUR VERCEL APP URL
    const DEBUG_API_URL = 'https://your-app-name.vercel.app/api/debug-data';
    
    // Generate unique session ID
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Collect all browser data
    function collectBrowserData() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            platform: navigator.platform,
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenColorDepth: screen.colorDepth,
            screenPixelDepth: screen.pixelDepth,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            windowOuterWidth: window.outerWidth,
            windowOuterHeight: window.outerHeight,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            performance: {
                timeOrigin: performance.timeOrigin,
                navigationStart: performance.timing ? performance.timing.navigationStart : null,
                loadEventEnd: performance.timing ? performance.timing.loadEventEnd : null,
                domContentLoadedEventEnd: performance.timing ? performance.timing.domContentLoadedEventEnd : null
            },
            localStorage: {
                available: typeof(Storage) !== "undefined",
                length: localStorage.length
            },
            sessionStorage: {
                available: typeof(Storage) !== "undefined",
                length: sessionStorage.length
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currentTime: new Date().toISOString(),
            currentUrl: window.location.href,
            referrer: document.referrer,
            pageLoadTime: Date.now() - performance.timeOrigin
        };
    }
    
    // Collect order data from the page
    function collectOrderData() {
        const orderData = {
            orderId: null,
            orderDate: null,
            orderTotal: null,
            orderItems: [],
            customerInfo: {},
            paymentMethod: null,
            discount: null,
            shipping: null,
            tax: null
        };
        
        try {
            // Extract order ID from URL
            const orderIdMatch = window.location.pathname.match(/order-received\/(\d+)/);
            if (orderIdMatch) {
                orderData.orderId = orderIdMatch[1];
            }
            
            // Extract order details from page content
            const orderDetails = document.querySelector('.woocommerce-order');
            if (orderDetails) {
                // Order ID from page content
                const orderIdText = orderDetails.querySelector('span:contains("Order ID")');
                if (orderIdText) {
                    orderData.orderId = orderIdText.textContent.replace('Order ID', '').trim();
                }
                
                // Order date
                const dateText = orderDetails.querySelector('span:contains("Date")');
                if (dateText) {
                    orderData.orderDate = dateText.textContent.replace('Date', '').trim();
                }
                
                // Order total
                const totalElement = orderDetails.querySelector('.woocommerce-Price-amount.amount');
                if (totalElement) {
                    orderData.orderTotal = totalElement.textContent.trim();
                }
                
                // Order items
                const orderItems = orderDetails.querySelectorAll('.woocommerce-table__line-item');
                orderItems.forEach(item => {
                    const productName = item.querySelector('.product-name');
                    const productTotal = item.querySelector('.product-total');
                    if (productName && productTotal) {
                        orderData.orderItems.push({
                            name: productName.textContent.trim(),
                            total: productTotal.textContent.trim()
                        });
                    }
                });
                
                // Customer info
                const customerSection = orderDetails.querySelector('.buyer__details__wrapper');
                if (customerSection) {
                    const customerTexts = customerSection.querySelectorAll('span');
                    customerTexts.forEach(span => {
                        const text = span.textContent.trim();
                        if (text.includes('@')) {
                            orderData.customerInfo.email = text;
                        } else if (text.match(/^\+\d/)) {
                            orderData.customerInfo.phone = text;
                        } else if (text.length > 0) {
                            if (!orderData.customerInfo.name) {
                                orderData.customerInfo.name = text;
                            } else if (!orderData.customerInfo.address) {
                                orderData.customerInfo.address = text;
                            }
                        }
                    });
                }
                
                // Payment, discount, shipping, tax
                const tfoot = orderDetails.querySelector('tfoot');
                if (tfoot) {
                    const rows = tfoot.querySelectorAll('tr');
                    rows.forEach(row => {
                        const th = row.querySelector('th');
                        const td = row.querySelector('td');
                        if (th && td) {
                            const label = th.textContent.trim();
                            const value = td.textContent.trim();
                            
                            if (label.includes('Discount')) {
                                orderData.discount = value;
                            } else if (label.includes('Delivery')) {
                                orderData.shipping = value;
                            } else if (label.includes('Tax')) {
                                orderData.tax = value;
                            } else if (label.includes('Total')) {
                                orderData.orderTotal = value;
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error collecting order data:', error);
        }
        
        return orderData;
    }
    
    // Collect GA4 data
    function collectGA4Data() {
        const ga4Data = {
            gtag: typeof gtag !== 'undefined' ? 'available' : 'not_available',
            dataLayer: typeof dataLayer !== 'undefined' ? dataLayer : [],
            ga4Events: [],
            clientId: null,
            sessionId: null
        };
        
        try {
            // Try to get GA4 client ID
            if (typeof gtag !== 'undefined') {
                gtag('get', 'G-XXXXXXXXXX', 'client_id', function(clientId) {
                    ga4Data.clientId = clientId;
                });
            }
            
            // Check for recent GA4 events in dataLayer
            if (typeof dataLayer !== 'undefined') {
                const recentEvents = dataLayer.filter(event => 
                    event.event && (
                        event.event === 'purchase' || 
                        event.event === 'begin_checkout' ||
                        event.event === 'add_to_cart'
                    )
                );
                ga4Data.ga4Events = recentEvents;
            }
            
            // Check for GA4 cookies
            const ga4Cookies = document.cookie.split(';').filter(cookie => 
                cookie.includes('_ga') || cookie.includes('_gid') || cookie.includes('_ga_')
            );
            ga4Data.cookies = ga4Cookies;
            
        } catch (error) {
            console.error('Error collecting GA4 data:', error);
        }
        
        return ga4Data;
    }
    
    // Collect GTM data
    function collectGTMData() {
        const gtmData = {
            gtm: typeof gtm !== 'undefined' ? 'available' : 'not_available',
            dataLayer: typeof dataLayer !== 'undefined' ? dataLayer : [],
            gtmEvents: [],
            containerId: null
        };
        
        try {
            // Check for GTM container ID
            const gtmScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
            gtmScripts.forEach(script => {
                const src = script.src;
                const match = src.match(/gtm\.js\?id=([^&]+)/);
                if (match) {
                    gtmData.containerId = match[1];
                }
            });
            
            // Check for recent GTM events
            if (typeof dataLayer !== 'undefined') {
                const recentEvents = dataLayer.filter(event => 
                    event.event && event.event !== 'gtm.js' && event.event !== 'gtm.load'
                );
                gtmData.gtmEvents = recentEvents;
            }
            
        } catch (error) {
            console.error('Error collecting GTM data:', error);
        }
        
        return gtmData;
    }
    
    // Collect Stape.io data
    function collectStapeData() {
        const stapeData = {
            stape: typeof stape !== 'undefined' ? 'available' : 'not_available',
            stapeEvents: [],
            serverSideEvents: []
        };
        
        try {
            // Check for Stape.io scripts
            const stapeScripts = document.querySelectorAll('script[src*="stape.io"]');
            stapeData.scripts = Array.from(stapeScripts).map(script => script.src);
            
            // Check for any Stape-related data
            if (typeof stape !== 'undefined') {
                stapeData.stape = 'available';
            }
            
        } catch (error) {
            console.error('Error collecting Stape data:', error);
        }
        
        return stapeData;
    }
    
    // Collect debug information
    function collectDebugInfo() {
        return {
            scriptLoadTime: Date.now(),
            pageReady: document.readyState,
            domContentLoaded: performance.timing ? performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart : null,
            loadComplete: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : null,
            errors: [],
            warnings: []
        };
    }
    
    // Send data to debug API
    async function sendDebugData() {
        try {
            const debugData = {
                orderData: collectOrderData(),
                browserData: collectBrowserData(),
                ga4Data: collectGA4Data(),
                gtmData: collectGTMData(),
                stapeData: collectStapeData(),
                debugInfo: collectDebugInfo(),
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href,
                userAgent: navigator.userAgent,
                sessionId: sessionId,
                clientId: null
            };
            
            // Try to get GA4 client ID
            if (typeof gtag !== 'undefined') {
                gtag('get', 'G-XXXXXXXXXX', 'client_id', function(clientId) {
                    debugData.clientId = clientId;
                    sendDataToAPI(debugData);
                });
            } else {
                sendDataToAPI(debugData);
            }
            
        } catch (error) {
            console.error('Error collecting debug data:', error);
        }
    }
    
    async function sendDataToAPI(data) {
        try {
            const response = await fetch(DEBUG_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log('Debug data sent successfully');
            } else {
                console.error('Failed to send debug data:', response.status);
            }
        } catch (error) {
            console.error('Error sending debug data:', error);
        }
    }
    
    // Initialize data collection
    function init() {
        // Send data when page is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', sendDebugData);
        } else {
            sendDebugData();
        }
        
        // Also send data when GA4 purchase event might fire
        if (typeof dataLayer !== 'undefined') {
            const originalPush = dataLayer.push;
            dataLayer.push = function(...args) {
                const result = originalPush.apply(this, args);
                
                // Check if this is a purchase event
                if (args[0] && args[0].event === 'purchase') {
                    setTimeout(() => {
                        sendDebugData();
                    }, 1000); // Wait a bit for the event to process
                }
                
                return result;
            };
        }
        
        // Send data on page unload as well
        window.addEventListener('beforeunload', sendDebugData);
    }
    
    // Start the debug collection
    init();
    
})();
</script>
```

### Step 3: Access the Debug Dashboard

1. **View Debug Data:**
   - Go to: `https://your-app-name.vercel.app/debug`
   - This will show all collected debug data

2. **Analyze the Data:**
   - Compare records where GA4 events were successful vs failed
   - Look for patterns in browser data, connection types, etc.
   - Check if there are differences in GA4 client IDs or event timing

## 🔍 What to Look For

### Successful vs Failed GA4 Events
- **Browser differences:** Different browsers, versions, or extensions
- **Connection issues:** Slow connections, mobile vs desktop
- **Timing issues:** Page load times, event firing delays
- **Cookie issues:** Ad blockers, privacy settings
- **Script conflicts:** Other scripts interfering with GA4

### Common Issues to Check
1. **Ad blockers** blocking GA4 scripts
2. **Slow connections** causing timeouts
3. **Browser extensions** interfering with tracking
4. **Mobile browsers** with different behavior
5. **Script loading order** issues
6. **Network errors** during event sending

## 📊 Dashboard Features

The debug dashboard provides:
- ✅ **Order comparison** - See which orders had successful/failed tracking
- ✅ **Browser analysis** - Compare browser types, versions, settings
- ✅ **Performance metrics** - Page load times, connection speeds
- ✅ **Event details** - Raw GA4/GTM event data
- ✅ **Timing analysis** - When events fired vs when data was collected
- ✅ **Raw data export** - Full JSON data for detailed analysis

## 🎯 Next Steps

1. **Deploy the system** and add the script to your thank you page
2. **Collect data** for 50-100 orders
3. **Analyze patterns** in the dashboard
4. **Identify root causes** of missing GA4 events
5. **Implement fixes** based on findings

This system will give you complete visibility into what's happening when users complete purchases and help you identify why some GA4 events are getting lost! 🚀 