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

  debounceTime: 250, //ms

  cleanUpPath:  path => {
    if (path[0] === "/") {
      path = path.slice(1)
    }
    return path.trim().replace(' ','-');
  },

  componentWillMount: function () {
    // Listen reactively to history changes
    this.handlers.history = Rx.Observable.fromHistory(this.props.history)
      .pluck("pathname")
      .map( this.cleanUpPath )
      .filter( path => path.length > 0 )
      .distinctUntilChanged()
      .debounce( this.debounceTime )
      .subscribe( this.search );

    this.handlers.history = Rx.Observable.fromHistory(this.props.history)
      .pluck("pathname")
      .map( this.cleanUpPath )
      .filter( path => path.length === 0 )
      .distinctUntilChanged()
      .subscribe( this.welcomePage );
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

  welcomePage: function () {
    this.display( " # Welcome " );
  },

  error: function (err) {
    this.display( " # Command Not Found " );
  },

  search: function (cmd) {
    Command
      .search(cmd)
      .subscribe(this.fetch, this.error);
  },

  fetch: function (cmd) {
    Page
      .get(cmd)
      .subscribe(this.display, this.error)
  },

  display: function (page) {
    this.setState({ body: page });
  }

});
