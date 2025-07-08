// GA4 Debug Data Collection Script
// Enhanced version with detailed browser, OS, and privacy detection
// Add this to your thank you page to collect comprehensive debug data

(function() {
    'use strict';
    
    // Configuration - Update this URL to your debug API endpoint
    const DEBUG_API_URL = 'https://ga4-debug.vercel.app/api/debug-data';
    
    // Generate unique session ID
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Detect browser and OS details
    function detectBrowserAndOS() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        let browser = {
            name: 'Unknown',
            version: 'Unknown',
            engine: 'Unknown',
            isMobile: false,
            isTablet: false,
            isDesktop: false
        };
        
        let os = {
            name: 'Unknown',
            version: 'Unknown',
            isMobile: false,
            isTablet: false,
            isDesktop: false
        };
        
        // Browser detection
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browser.name = 'Chrome';
            browser.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Firefox')) {
            browser.name = 'Firefox';
            browser.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser.name = 'Safari';
            browser.version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Edge')) {
            browser.name = 'Edge';
            browser.version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('Opera')) {
            browser.name = 'Opera';
            browser.version = userAgent.match(/Opera\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
            browser.name = 'Internet Explorer';
            browser.version = userAgent.match(/MSIE (\d+)/)?.[1] || userAgent.match(/rv:(\d+)/)?.[1] || 'Unknown';
        }
        
        // OS detection
        if (userAgent.includes('Windows')) {
            os.name = 'Windows';
            if (userAgent.includes('Windows NT 10.0')) os.version = '10';
            else if (userAgent.includes('Windows NT 6.3')) os.version = '8.1';
            else if (userAgent.includes('Windows NT 6.2')) os.version = '8';
            else if (userAgent.includes('Windows NT 6.1')) os.version = '7';
            else if (userAgent.includes('Windows NT 6.0')) os.version = 'Vista';
            else if (userAgent.includes('Windows NT 5.2')) os.version = 'XP x64';
            else if (userAgent.includes('Windows NT 5.1')) os.version = 'XP';
            else os.version = 'Unknown';
        } else if (userAgent.includes('Mac OS X')) {
            os.name = 'macOS';
            const match = userAgent.match(/Mac OS X (\d+)_(\d+)/);
            if (match) {
                const major = parseInt(match[1]);
                const minor = parseInt(match[2]);
                if (major === 10) {
                    if (minor >= 15) os.version = 'Catalina+';
                    else if (minor >= 14) os.version = 'Mojave';
                    else if (minor >= 13) os.version = 'High Sierra';
                    else if (minor >= 12) os.version = 'Sierra';
                    else os.version = 'El Capitan or earlier';
                } else if (major >= 11) {
                    os.version = 'Big Sur+';
                }
            }
        } else if (userAgent.includes('Linux')) {
            os.name = 'Linux';
            if (userAgent.includes('Ubuntu')) os.version = 'Ubuntu';
            else if (userAgent.includes('Fedora')) os.version = 'Fedora';
            else if (userAgent.includes('CentOS')) os.version = 'CentOS';
            else if (userAgent.includes('Debian')) os.version = 'Debian';
            else os.version = 'Unknown';
        } else if (userAgent.includes('Android')) {
            os.name = 'Android';
            const match = userAgent.match(/Android (\d+)/);
            os.version = match ? match[1] : 'Unknown';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            os.name = 'iOS';
            const match = userAgent.match(/OS (\d+)_(\d+)/);
            if (match) {
                const major = parseInt(match[1]);
                const minor = parseInt(match[2]);
                os.version = `${major}.${minor}`;
            }
        }
        
        // Device type detection
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
        
        browser.isMobile = isMobile;
        browser.isTablet = isTablet;
        browser.isDesktop = !isMobile && !isTablet;
        
        os.isMobile = isMobile;
        os.isTablet = isTablet;
        os.isDesktop = !isMobile && !isTablet;
        
        return { browser, os };
    }
    
    // Detect private/incognito mode
    async function detectPrivateMode() {
        const tests = {
            // Test 1: FileSystem API
            fileSystem: () => {
                try {
                    if (window.webkitRequestFileSystem) {
                        return new Promise((resolve) => {
                            window.webkitRequestFileSystem(window.TEMPORARY, 1, () => resolve(false), () => resolve(true));
                        });
                    }
                    return Promise.resolve(null);
                } catch (e) {
                    return Promise.resolve(null);
                }
            },
            
            // Test 2: IndexedDB
            indexedDB: () => {
                try {
                    const db = indexedDB.open('test');
                    return new Promise((resolve) => {
                        db.onsuccess = () => {
                            db.result.close();
                            indexedDB.deleteDatabase('test');
                            resolve(false);
                        };
                        db.onerror = () => resolve(true);
                    });
                } catch (e) {
                    return Promise.resolve(null);
                }
            },
            
            // Test 3: LocalStorage
            localStorage: () => {
                try {
                    const test = '__localStorage_test__';
                    localStorage.setItem(test, 'test');
                    localStorage.removeItem(test);
                    return Promise.resolve(false);
                } catch (e) {
                    return Promise.resolve(true);
                }
            },
            
            // Test 4: SessionStorage
            sessionStorage: () => {
                try {
                    const test = '__sessionStorage_test__';
                    sessionStorage.setItem(test, 'test');
                    sessionStorage.removeItem(test);
                    return Promise.resolve(false);
                } catch (e) {
                    return Promise.resolve(true);
                }
            },
            
            // Test 5: Cookies
            cookies: () => {
                try {
                    document.cookie = '__cookie_test__=test';
                    const hasCookie = document.cookie.includes('__cookie_test__');
                    document.cookie = '__cookie_test__=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    return Promise.resolve(!hasCookie);
                } catch (e) {
                    return Promise.resolve(null);
                }
            }
        };
        
        const results = {};
        for (const [name, test] of Object.entries(tests)) {
            results[name] = await test();
        }
        
        // Determine if in private mode based on test results
        const privateModeIndicators = Object.values(results).filter(result => result === true).length;
        const totalTests = Object.values(results).filter(result => result !== null).length;
        
        return {
            isPrivateMode: privateModeIndicators > 0,
            confidence: totalTests > 0 ? (privateModeIndicators / totalTests) * 100 : 0,
            testResults: results
        };
    }
    
    // Detect ad blockers and privacy extensions
    async function detectAdBlockers() {
        const adBlockTests = {
            // Test for common ad blocker patterns
            adBlockDetected: false,
            privacyExtensions: [],
            blockedElements: [],
            blockedScripts: []
        };
        
        // Test 1: Check if common ad elements are blocked
        const adSelectors = [
            '.ad', '.ads', '.advertisement', '.banner-ad',
            '[id*="google_ads"]', '[id*="ad-"]', '[class*="ad-"]',
            'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]'
        ];
        
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length === 0) {
                    adBlockTests.blockedElements.push(selector);
                }
            } catch (e) {
                // Ignore errors
            }
        });
        
        // Test 2: Check for privacy extensions
        const privacyExtensions = [
            { name: 'uBlock Origin', test: () => window.ublock0 || window.uboOpen },
            { name: 'AdBlock Plus', test: () => window.adblockplus || window.AdBlock },
            { name: 'Ghostery', test: () => window.ghostery || window.GHOSTERY },
            { name: 'Privacy Badger', test: () => window.privacyBadger },
            { name: 'DuckDuckGo', test: () => window.duckduckgo },
            { name: 'Brave', test: () => navigator.brave },
            { name: 'Firefox Enhanced Tracking Protection', test: () => navigator.userAgent.includes('Firefox') && window.navigator.doNotTrack === '1' }
        ];
        
        privacyExtensions.forEach(ext => {
            if (ext.test()) {
                adBlockTests.privacyExtensions.push(ext.name);
            }
        });
        
        // Test 3: Check for script blocking
        const testScript = document.createElement('script');
        testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        testScript.onerror = () => {
            adBlockTests.blockedScripts.push('Google AdSense');
        };
        document.head.appendChild(testScript);
        
        // Determine if ad blocker is likely present
        adBlockTests.adBlockDetected = adBlockTests.blockedElements.length > 0 || 
                                      adBlockTests.privacyExtensions.length > 0 ||
                                      adBlockTests.blockedScripts.length > 0;
        
        return adBlockTests;
    }
    
    // Get IP address (requires external service)
    async function getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return {
                ip: data.ip,
                source: 'ipify.org'
            };
        } catch (error) {
            try {
                const response = await fetch('https://httpbin.org/ip');
                const data = await response.json();
                return {
                    ip: data.origin,
                    source: 'httpbin.org'
                };
            } catch (error2) {
                return {
                    ip: 'Unknown',
                    source: 'Failed to detect'
                };
            }
        }
    }
    
    // Collect all browser data
    async function collectBrowserData() {
        const { browser, os } = detectBrowserAndOS();
        const privateMode = await detectPrivateMode();
        const adBlockers = await detectAdBlockers();
        const ipInfo = await getIPAddress();
        
        return {
            // Browser and OS info
            browser,
            os,
            
            // Private mode detection
            privateMode,
            
            // Ad blocker detection
            adBlockers,
            
            // IP address
            ipAddress: ipInfo,
            
            // Basic browser info
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            platform: navigator.platform,
            
            // Screen and window info
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenColorDepth: screen.colorDepth,
            screenPixelDepth: screen.pixelDepth,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            windowOuterWidth: window.outerWidth,
            windowOuterHeight: window.outerHeight,
            
            // Connection info
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            
            // Performance info
            performance: {
                timeOrigin: performance.timeOrigin,
                navigationStart: performance.timing ? performance.timing.navigationStart : null,
                loadEventEnd: performance.timing ? performance.timing.loadEventEnd : null,
                domContentLoadedEventEnd: performance.timing ? performance.timing.domContentLoadedEventEnd : null
            },
            
            // Storage info
            localStorage: {
                available: typeof(Storage) !== "undefined",
                length: localStorage.length
            },
            sessionStorage: {
                available: typeof(Storage) !== "undefined",
                length: sessionStorage.length
            },
            
            // Timezone and date
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currentTime: new Date().toISOString(),
            
            // URL and referrer
            currentUrl: window.location.href,
            referrer: document.referrer,
            
            // Page load time
            pageLoadTime: Date.now() - performance.timeOrigin,
            
            // Additional privacy settings
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            maxTouchPoints: navigator.maxTouchPoints,
            
            // Canvas fingerprinting resistance
            canvasFingerprint: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.textBaseline = 'top';
                    ctx.font = '14px Arial';
                    ctx.fillText('Canvas fingerprint test', 2, 2);
                    return canvas.toDataURL();
                } catch (e) {
                    return 'Blocked';
                }
            })(),
            
            // WebGL fingerprinting
            webglFingerprint: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    if (gl) {
                        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                        return {
                            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                        };
                    }
                    return 'Not available';
                } catch (e) {
                    return 'Blocked';
                }
            })()
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
            // Extract order ID
            const orderIdMatch = window.location.pathname.match(/order-received\/(\d+)/);
            if (orderIdMatch) {
                orderData.orderId = orderIdMatch[1];
            }
            
            // Extract order details from the page
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
                browserData: await collectBrowserData(),
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