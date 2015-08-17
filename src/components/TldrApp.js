import React from 'react';

// Import components
import SearchBar from './SearchBar';
import Results from './Results';

class TldrApp extends React.Component {

  render () {
    return (
        <div>
          <SearchBar />
          <Results />
        </div>
      );
  }

}

export default TldrApp;
