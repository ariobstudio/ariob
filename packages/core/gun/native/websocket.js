const webSockets = new Map();
let nextId = 1;

(() => {
    'background only'
    const nativeBridge = lynx.getJSModule('GlobalEventEmitter');

    // This listener handles the 'open' event for a WebSocket connection.
    nativeBridge.addListener('websocket:open', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id } = event;
        const ws = webSockets.get(id);
        if (ws && ws.onopen) {
            ws.onopen();
        }
    });

    // This listener handles incoming messages on a WebSocket.
    nativeBridge.addListener('websocket:message', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id, data } = event;
        const ws = webSockets.get(id);
        if (ws && ws.onmessage) {
            ws.onmessage({ data });
        }
    });

    // This listener handles any errors that occur on the WebSocket connection.
    nativeBridge.addListener('websocket:error', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id, message } = event;
        const ws = webSockets.get(id);
        if (ws && ws.onerror) {
            ws.onerror(new Error(message));
        }
    });

    // This listener handles the closing of a WebSocket connection.
    nativeBridge.addListener('websocket:close', (event) => {
        // Parameters from sendGlobalEvent:withParams: are spread onto event object
        const { id, code, reason } = event;
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

            webSockets.set(this.id, this);
            NativeModules.NativeWebSocketModule.connect(url, this.id);
        }

        send(message) {
            NativeModules.NativeWebSocketModule.send(this.id, message);
        }

        close(code = 1000, reason = 'Normal closure') {
            NativeModules.NativeWebSocketModule.close(this.id, code, reason);
        }
    };
})();