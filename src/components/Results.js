import React from 'react';

import Rx from 'rx';
import fromHistory from '../lib/Rx.History.js';
Rx.Observable.fromHistory = fromHistory;

// External Dependencies
import marked from 'marked';

marked.setOptions({
  gfm: true
});

// Actions
import { Page } from '../actions/Page';
import { Command } from '../actions/Command';

export default React.createClass({
  handlers: {},

  componentWillMount: function () {
    // Listen reactively to history changes
    this.handlers.history = Rx.Observable.fromHistory(this.props.history)
      .pluck("pathname")
      .map( path => path.slice(1) )
      .filter( path => path.length > 0 )
      .distinctUntilChanged()
      .forEach( this.fetch );
  },

  getInitialState: function () {
    return {body: ""};
  },

  render: function () {
    let markup = marked(this.state.body);
    return (
      <div id="page" dangerouslySetInnerHTML={{__html: markup }} />
    );
  },

  fetch: function (cmd) {
    Command
     .search(cmd)
     .flatMapLatest(this.display);
  },

  display: function (page) {
    Page
      .get(cmd)
      .flatMapLatest( page => {
        if (page) {
          this.setState({ body: page });
        } else {
          console.log(page+" not found");
        }
      });
  }

});
