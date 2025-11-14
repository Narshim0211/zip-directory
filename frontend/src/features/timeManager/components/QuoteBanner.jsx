import React, { useEffect, useState } from 'react';
import visitorTimeApi from '../../../api/visitorTimeApi';
import ownerTimeApi from '../../../api/ownerTimeApi';
import '../styles/timeManager.css';

export default function QuoteBanner({ role = 'visitor' }) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = role === 'owner' ? ownerTimeApi : visitorTimeApi;
        if (!api.getQuote) return; // optional for owner
        const data = await api.getQuote();
        if (!mounted) return;
        // Handle different response formats
        if (typeof data === 'string') {
          setQuote(data);
        } else if (data?.quote?.content) {
          // API returns { success: true, quote: { content, author } }
          setQuote(data.quote.content);
        } else if (data?.content) {
          // Direct quote object { content, author }
          setQuote(data.content);
        } else {
          setQuote('');
        }
      } catch (_) {
        // best-effort only
      }
    })();
    return () => { mounted = false; };
  }, [role]);

  if (!quote) return null;
  return (
    <div className="tm-quote">
      <span className="tm-quote__icon">“</span>
      <span>{quote}</span>
    </div>
  );
}
