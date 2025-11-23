import React from 'react';
import UnifiedSearchBar from '../../components/UnifiedSearchBar';

const SearchSection = () => {
  return (
    <div
      className="search-section"
      style={{
        padding: '80px 5% 60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        marginBottom: '24px'
      }}
    >
      <h1
        style={{
          color: '#fff',
          textAlign: 'center',
          fontSize: '48px',
          fontWeight: 800,
          marginBottom: '12px',
          lineHeight: '1.2'
        }}
      >
        Discover Top-Rated <span style={{ color: '#fbbf24' }}>Salons & Spas</span>
      </h1>
      <p
        style={{
          color: 'rgba(255,255,255,0.95)',
          textAlign: 'center',
          fontSize: '18px',
          marginBottom: '40px',
          fontWeight: 400
        }}
      >
        Browse trusted local professionals near you. Simple. Fast. Free.
      </p>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <UnifiedSearchBar
          size="large"
          placeholder="Braids, Dallas, 75001..."
          autoFocus={false}
        />
      </div>
    </div>
  );
};

export default SearchSection;
