import React from 'react';
//import { createHistory } from 'history';
import createHistory from 'history/lib/createHashHistory';

// Import components
import SearchBar from './SearchBar';
import Results   from './Results';

import { Command } from '../actions/Command';

let history = createHistory();

class TldrApp extends React.Component {

  componentWillMount () {
    Command.getIndex().subscribe();
  }

  render () {
    return (
      <div>
        <SearchBar history={history}/>
        <Results   history={history}/>
      </div>
    );
  }

}

export default TldrApp;
