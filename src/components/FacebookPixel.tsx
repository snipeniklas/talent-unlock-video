import { useEffect } from 'react';

// Facebook Pixel Event Types
export type FacebookEvent = 
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'Lead'
  | 'CompleteRegistration';

// Event Parameter Types
interface BaseEventParams {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  status?: string;
}

// Declare fbq on window object
declare global {
  interface Window {
    fbq: (
      action: 'track' | 'init',
      eventName: string,
      params?: BaseEventParams
    ) => void;
    _fbq: Window['fbq'];
  }
}

// Track Facebook Pixel Events
export const trackEvent = (eventName: FacebookEvent, params?: BaseEventParams) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

const FacebookPixel = () => {
  const pixelId = import.meta.env.VITE_FB_PIXEL_ID || '802609469182864';

  useEffect(() => {
    // Prevent double initialization
    if (window.fbq) return;

    // Facebook Pixel Base Code
    (function(f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: HTMLScriptElement) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
      s.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize Pixel
    window.fbq('init', pixelId);
    
    // Track PageView
    window.fbq('track', 'PageView');
  }, [pixelId]);

  return (
    <>
      {/* Noscript fallback for Facebook Pixel */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

export default FacebookPixel;
