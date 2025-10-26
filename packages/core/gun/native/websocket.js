const webSockets = new Map();
let nextId = 1;

(() => {
    'background only'
    const nativeBridge = lynx.getJSModule('GlobalEventEmitter');

    // This listener handles the 'open' event for a WebSocket connection.
    nativeBridge.addListener('websocket:open', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id } = event;
        console.log('[WebSocket] ========== CONNECTION OPENED ==========');
        console.log('[WebSocket] ID:', id);
        const ws = webSockets.get(id);
        if (ws) {
            console.log('[WebSocket] URL:', ws.url);
        }
        console.log('[WebSocket] =======================================');
        if (ws && ws.onopen) {
            ws.onopen();
        }
    });

    // This listener handles incoming messages on a WebSocket.
    nativeBridge.addListener('websocket:message', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id, data } = event;

        console.log('[WebSocket] ========== INCOMING MESSAGE ==========');
        console.log('[WebSocket] ID:', id);
        console.log('[WebSocket] Raw data:', data.slice(0, 300));

        // Log incoming messages to debug user space callbacks
        try {
            const parsed = JSON.parse(data);
            if (parsed.put) {
                console.log('[WebSocket] ✅ Contains "put" key');
                Object.keys(parsed.put).forEach(soul => {
                    if (soul.startsWith('~')) {
                        console.log('[WebSocket] ✅ INCOMING USER SPACE DATA');
                        console.log('[WebSocket] Soul:', soul);
                        console.log('[WebSocket] Data:', JSON.stringify(parsed.put[soul]).slice(0, 200));
                    }
                });
            } else {
                console.log('[WebSocket] Message type:', Object.keys(parsed).join(', '));
            }
        } catch (e) {
            console.log('[WebSocket] Failed to parse message:', e.message);
        }
        console.log('[WebSocket] ========================================');

        const ws = webSockets.get(id);
        if (ws && ws.onmessage) {
            ws.onmessage({ data });
        }
    });

    // This listener handles any errors that occur on the WebSocket connection.
    nativeBridge.addListener('websocket:error', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id, message } = event;
        console.log('[WebSocket] ========== ERROR ==========');
        console.log('[WebSocket] ID:', id);
        console.log('[WebSocket] Error:', message);
        console.log('[WebSocket] ====================================');

        const ws = webSockets.get(id);
        if (ws && ws.onerror) {
            ws.onerror(new Error(message));
        }
    });

    // This listener handles the closing of a WebSocket connection.
    nativeBridge.addListener('websocket:close', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id, code, reason } = event;
        console.log('[WebSocket] ========== CONNECTION CLOSED ==========');
        console.log('[WebSocket] ID:', id);
        console.log('[WebSocket] Code:', code);
        console.log('[WebSocket] Reason:', reason);
        console.log('[WebSocket] =======================================');

        const ws = webSockets.get(id);
        if (ws && ws.onclose) {
            ws.onclose({ code, reason });
        }
        // Clean up the instance after the connection is closed.
        webSockets.delete(id);
    });

    // Polyfill the global WebSocket object.
    global.WebSocket = class WebSocket {
        constructor(url) {
            this.id = nextId++;
            this.url = url;

            // Callback properties to be set by the user.
            this.onopen = null;
            this.onmessage = null;
            this.onerror = null;
            this.onclose = null;

            console.log('[WebSocket] Creating new WebSocket connection');
            console.log('[WebSocket]   ID:', this.id);
            console.log('[WebSocket]   URL:', url);

            webSockets.set(this.id, this);
            NativeModules.NativeWebSocketModule.connect(url, this.id);
        }

        send(message) {
            console.log('[WebSocket] ========== SENDING MESSAGE ==========');
            console.log('[WebSocket] ID:', this.id);
            console.log('[WebSocket] Message:', message.slice(0, 300));
            try {
                const parsed = JSON.parse(message);
                if (parsed.put) {
                    console.log('[WebSocket] ✅ Contains "put" key');
                    Object.keys(parsed.put).forEach(soul => {
                        if (soul.startsWith('~')) {
                            console.log('[WebSocket] ✅ OUTGOING USER SPACE DATA');
                            console.log('[WebSocket] Soul:', soul);
                        }
                    });
                }
            } catch (e) {
                // Ignore parse errors
            }
            console.log('[WebSocket] ========================================');
            NativeModules.NativeWebSocketModule.send(this.id, message);
        }

        close(code = 1000, reason = 'Normal closure') {
            console.log('[WebSocket] Closing connection');
            console.log('[WebSocket]   ID:', this.id);
            console.log('[WebSocket]   Code:', code);
            console.log('[WebSocket]   Reason:', reason);
            NativeModules.NativeWebSocketModule.close(this.id, code, reason);
        }
    };
})();