import React from 'react';
import { Router, Route } from 'react-router';
import createHistory from 'history/lib/createHashHistory';

import TldrApp from './components/TldrApp';

let history = createHistory({
  queryKey: false
});

React.render( (
  <Router history={history}>
    <Route path="*" component={TldrApp}>
    </Route>
  </Router>
),document.getElementById('tldr'));
