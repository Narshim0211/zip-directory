import React from 'react';
import UnifiedSearchBar from '../../components/UnifiedSearchBar';

const SearchSection = () => {
  return (
    <div className="search-section" style={{ padding: '20px 0' }}>
      <UnifiedSearchBar
        size="medium"
        placeholder="Braids, Dallas, 75001..."
        autoFocus={false}
      />
    </div>
  );
};

export default SearchSection;
