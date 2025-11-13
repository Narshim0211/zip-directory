import { useState, useEffect } from 'react';

/**
 * Hook to fetch owner's businesses for assignedTo suggestions
 * Returns array of business/staff options
 */
export default function useOwnerBusinesses() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/owner/business`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!res.ok) {
          console.warn('Failed to fetch businesses for assignment suggestions');
          return;
        }

        const data = await res.json();
        const businesses = Array.isArray(data) ? data : data?.data || data?.businesses || [];
        
        if (!mounted) return;

        // Build suggestions from businesses + common staff roles
        const suggestions = [];
        
        businesses.forEach(b => {
          if (b.name) suggestions.push(b.name);
        });

        // Add common salon staff roles
        const commonRoles = [
          'Stylist',
          'Colorist', 
          'Barber',
          'Nail Technician',
          'Esthetician',
          'Receptionist',
          'Manager',
          'Assistant'
        ];
        
        suggestions.push(...commonRoles);
        
        setOptions([...new Set(suggestions)]); // Dedupe
      } catch (error) {
        console.warn('Error fetching business suggestions:', error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBusinesses();

    return () => { mounted = false; };
  }, []);

  return { options, loading };
}
