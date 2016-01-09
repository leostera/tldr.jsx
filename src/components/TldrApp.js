import React from 'react';
//import { createHistory } from 'history';
import createHistory from 'history/lib/createHashHistory';

// Import components
import SearchBar from './SearchBar';
import Results   from './Results';

let history = createHistory();

class TldrApp extends React.Component {

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
