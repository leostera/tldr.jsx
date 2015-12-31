import React from 'react';

// Import components
import SearchBar from './SearchBar';
import Results from './Results';

import { Command } from '../actions/Command';

class TldrApp extends React.Component {

  componentWillMount () {
    Command.loadIndex();
  }

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
