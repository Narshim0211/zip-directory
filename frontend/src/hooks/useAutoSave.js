import { useEffect, useRef, useState } from 'react';

/**
 * useAutoSave Hook
 * Debounces API calls to auto-save profile changes
 *
 * @param {Function} saveFunction - The API call to save data
 * @param {number} delay - Debounce delay in milliseconds (default: 1000)
 * @returns {Object} { save, saving, saved, error }
 */
export function useAutoSave(saveFunction, delay = 1000) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const saveCountRef = useRef(0);

  const debouncedSave = (data) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset states
    setSaved(false);
    setError(null);

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveFunction(data);
        setSaving(false);
        setSaved(true);
        saveCountRef.current += 1;

        // Clear "saved" indicator after 2 seconds
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setSaving(false);
        setError(err.response?.data?.message || err.message || 'Save failed');
        console.error('Auto-save error:', err);
      }
    }, delay);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    save: debouncedSave,
    saving,
    saved,
    error,
    saveCount: saveCountRef.current,
  };
}
