/**
 * @fileoverview SSE (Server-Sent Events) client for the Mosaia SDK.
 *
 * Connects to the `mosaia-sse-relay-server` and parses its `{event, data}`
 * envelope into typed callbacks. Works in browsers (native `EventSource`),
 * Node.js 22+ (native `EventSource`), and older Node when the `eventsource`
 * package is installed and registered as `globalThis.EventSource`.
 *
 * Wire format from the relay (`mosaia-sse-relay-server/app/utils/sse.js`):
 *
 *   event: message
 *   data: {"event":"START","data":"<json string>"}
 *
 *   event: message
 *   data: {"event":"UPDATE","data":"<json string>"}
 *
 * The outer `data` is JSON; the inner `data` is itself a JSON string that
 * decodes to either the start info (object) or the changed document (object).
 *
 * @module utils/sse-client
 */

import { ConfigurationManager } from '../config';

/**
 * Generic shape of an event delivered by the relay.
 */
export interface SSEEnvelope<T = unknown> {
    event: 'START' | 'UPDATE' | string;
    data: T;
}

/**
 * Callback handlers for an SSE subscription.
 */
export interface SSESubscribeHandlers<TDoc = any, TStart = any> {
    /** Fired once on connect with the relay's `startInfo` payload. */
    onStart?: (info: TStart) => void;
    /** Fired for every change-stream update. */
    onUpdate: (doc: TDoc) => void;
    /** Fired on connection error. The connection will not be auto-reopened. */
    onError?: (err: Event | Error) => void;
    /** Fired when the connection is closed (either by client or server). */
    onClose?: () => void;
}

/**
 * Handle returned by `subscribe()`. Call `close()` to terminate the stream.
 */
export interface SSESubscription {
    close: () => void;
    /** Underlying EventSource readyState (0=connecting, 1=open, 2=closed). */
    readonly readyState: number;
}

type EventSourceCtor = new (url: string, init?: any) => any;

const resolveEventSource = (): EventSourceCtor => {
    const g = globalThis as any;
    if (typeof g.EventSource === 'function') {
        return g.EventSource as EventSourceCtor;
    }
    throw new Error(
        'EventSource is not available in this environment. ' +
        'Use Node.js 22+ (native EventSource) or install the `eventsource` ' +
        'package and assign it: `globalThis.EventSource = require("eventsource")`.'
    );
};

const buildAuthedUrl = (path: string): string => {
    const config = ConfigurationManager.getInstance();
    const base = config.getSseUrl();
    const apiKey = config.getApiKey();
    const session = (config.getConfig() as any).session;
    const token: string | undefined = apiKey || session?.access_token;

    if (!token) {
        throw new Error('Cannot open SSE stream: no apiKey or session token configured.');
    }

    // EventSource cannot send custom headers in the browser, so the relay
    // accepts the token via the `?token=` query string (see
    // mosaia-sse-relay-server/app/v1/authorize.js).
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${encodeURIComponent(token)}`;
};

/**
 * Open an SSE subscription to the relay at the given path (e.g. `/drive`,
 * `/drive/<id>`, `/item?drive=<id>`).
 *
 * @param path - Path under the SSE relay's `/v{version}` root.
 * @param handlers - Lifecycle callbacks.
 * @returns A subscription handle. Call `close()` to disconnect.
 *
 * @example
 * ```ts
 * const sub = subscribeToSSE('/drive', {
 *   onStart: (info) => console.log('connected', info),
 *   onUpdate: (doc) => console.log('drive changed', doc),
 *   onError: (err) => console.error(err),
 * });
 *
 * // later
 * sub.close();
 * ```
 */
export function subscribeToSSE<TDoc = any, TStart = any>(
    path: string,
    handlers: SSESubscribeHandlers<TDoc, TStart>
): SSESubscription {
    const EventSourceImpl = resolveEventSource();
    const url = buildAuthedUrl(path);
    const es = new EventSourceImpl(url);
    let closedByClient = false;

    es.onmessage = (msg: MessageEvent) => {
        let envelope: SSEEnvelope<string>;
        try {
            envelope = JSON.parse(msg.data);
        } catch (e) {
            handlers.onError?.(e as Error);
            return;
        }

        let payload: any;
        try {
            payload = typeof envelope.data === 'string'
                ? JSON.parse(envelope.data)
                : envelope.data;
        } catch (e) {
            // Inner data wasn't JSON — pass through as-is.
            payload = envelope.data;
        }

        if (envelope.event === 'START') {
            handlers.onStart?.(payload as TStart);
        } else if (envelope.event === 'UPDATE') {
            handlers.onUpdate(payload as TDoc);
        }
    };

    es.onerror = (err: Event) => {
        handlers.onError?.(err);
        // Browser EventSource auto-reconnects; if the relay is permanently
        // unreachable readyState will become CLOSED (2). Surface that as
        // onClose so callers can react.
        if (es.readyState === 2 && !closedByClient) {
            handlers.onClose?.();
        }
    };

    return {
        close: () => {
            if (closedByClient) return;
            closedByClient = true;
            es.close();
            handlers.onClose?.();
        },
        get readyState() {
            return es.readyState;
        },
    };
}
