import { useEffect } from 'react';

export default function useLocalSync(key, state) {
  // best-effort localStorage caching; replace with IndexedDB if needed
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (_) {
      // ignore quota errors
    }
  }, [key, state]);
}
