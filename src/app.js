import React from 'react';
import createHistory from 'history/lib/createHashHistory';

import TldrApp from './components/TldrApp';

let history = createHistory({
  queryKey: false
});

React.render( (
  <TldrApp />
), document.getElementById('tldr'));
