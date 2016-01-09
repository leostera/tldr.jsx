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
      .map( path => path[0] === "/" ? path.slice(1) : path )
      .filter( path => path.length > 0 )
      .distinctUntilChanged()
      .debounce(200)
      .subscribe( this.search );

    this.handlers.history = Rx.Observable.fromHistory(this.props.history)
      .pluck("pathname")
      .map( path => path[0] === "/" ? path.slice(1) : path )
      .filter( path => path.length === 0 )
      .distinctUntilChanged()
      .debounce(200)
      .subscribe( this.emptyPage );
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

  emptyPage: function () {
    this.display( " # Welcome " );
  },

  error: function (err) {
    this.display( " # " + err);
  },

  search: function (cmd) {
    Command
      .search(cmd)
      .subscribe(this.fetch, this.error);
  },

  fetch: function (cmd) {
    Page
      .get(cmd)
      .subscribe(this.display, this.error);
  },

  display: function (page) {
    this.setState({ body: page });
  }

});
