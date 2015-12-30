import React from 'react';
import { Router, Route } from 'react-router';
import { createHistory } from 'history';

import TldrApp from './components/TldrApp';

let history = createHistory();

React.render( (
  <Router history={history}>
    <Route path="*" component={TldrApp}>
    </Route>
  </Router>
),document.getElementById('tldr'));
