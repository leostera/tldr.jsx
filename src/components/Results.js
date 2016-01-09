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
    let cleanUpPath = path => {
      if (path[0] === "/") {
        path = path.slice(1)
      }
      return path.trim().replace(' ','-');
    }
    // Listen reactively to history changes
    this.handlers.history = Rx.Observable.fromHistory(this.props.history)
      .pluck("pathname")
      .map( cleanUpPath )
      .filter( path => path.length > 0 )
      .distinctUntilChanged()
      .debounce(250)
      .subscribe( this.search );

    this.handlers.history = Rx.Observable.fromHistory(this.props.history)
      .pluck("pathname")
      .map( cleanUpPath )
      .filter( path => path.length === 0 )
      .distinctUntilChanged()
      .debounce(250)
      .subscribe( this.welcomePage );
  },

  getInitialState: function () {
    return {body: ""};
  },

  componentWillUpdate: function () {
    console.log("Oh no, I'm updating!...");
  },

  componentDidUpdate: function () {
    console.log("I...I AM GOD, I mean UPDATED");
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

  error: function () {
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
      .subscribe(this.display, this.error);
  },

  display: function (page) {
    this.setState({ body: page });
  }

});
