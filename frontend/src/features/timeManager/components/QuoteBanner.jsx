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
        setQuote(typeof data === 'string' ? data : data?.quote || '');
      } catch (_) {
        // best-effort only
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!quote) return null;
  return (
    <div className="tm-quote">
      <span className="tm-quote__icon">“</span>
      <span>{quote}</span>
    </div>
  );
}
