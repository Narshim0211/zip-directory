import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import BusinessCardSoft from '../../components/shared/BusinessCardSoft';
import { useAuth } from '../../context/AuthContext';
import './DirectorySearchResults.css';

/**
 * Directory Search Results Page
 * Shows soft profiles (public data only)
 * Login gate for viewing full profiles
 * NO duplication with visitor/owner explore pages
 */
const DirectorySearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract search parameters
  const q = searchParams.get('q');
  const city = searchParams.get('city');
  const zip = searchParams.get('zip');
  const category = searchParams.get('category');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (city) params.append('city', city);
        if (zip) params.append('zip', zip);
        if (category) params.append('category', category);

        const url = `/public/directory/search?${params.toString()}`;
        console.log('🔍 [FRONTEND] Fetching:', url);

        const { data } = await api.get(url);

        console.log('✅ [FRONTEND] Response:', data);
        setBusinesses(data.data || []);
      } catch (err) {
        console.error('❌ [FRONTEND] Failed to fetch businesses:', err);
        console.error('❌ [FRONTEND] Error details:', err.response?.data || err.message);
        setError('Unable to load businesses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch - backend handles empty search (shows all businesses)
    fetchBusinesses();
  }, [q, city, zip, category]);

  const handleViewProfile = (businessId) => {
    // Check if user is authenticated
    if (user && user.role === 'visitor') {
      // Authenticated visitor - go directly to full profile
      navigate(`/visitor/business/${businessId}`);
    } else {
      // Not authenticated - store redirect URL and navigate to login
      sessionStorage.setItem('redirectAfterAuth', `/visitor/business/${businessId}`);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="directory-results">
        <div className="directory-results__loading">
          <div className="spinner"></div>
          <p>Searching for businesses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directory-results">
        <div className="directory-results__error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="directory-results">
      <div className="directory-results__header">
        <h1>Search Results {q && `for "${q}"`}</h1>
        <p className="directory-results__info">
          Found {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
          {city && ` in ${city}`}
          {zip && ` near ${zip}`}
          {category && category !== 'All Categories' && ` (${category})`}
        </p>
      </div>

      {businesses.length === 0 ? (
        <div className="directory-results__empty">
          <div className="empty-icon">🔍</div>
          <h2>No businesses found</h2>
          <p>Try adjusting your search criteria</p>
          <button onClick={() => window.location.href = '/directory'}>
            New Search
          </button>
        </div>
      ) : (
        <div className="directory-results__grid">
          {businesses.map((business) => (
            <BusinessCardSoft
              key={business.id}
              business={business}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default DirectorySearchResults;
