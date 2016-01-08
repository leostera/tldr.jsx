import React from 'react';

import Rx from 'rx';
import fromHistory from '../lib/Rx.History.js';
Rx.Observable.fromHistory = fromHistory;

import assign from 'object-assign';

// Other Components
import GithubOctocat from './GithubOctocat';

import { Command } from '../actions/Command';
import { Page } from '../actions/Page';

const ENTER_KEY_CODE = 13;

export default React.createClass({
  handlers: {},

  node: function () {
    // god please add this as a helper function
    //
    // All nodes with a ref value should be included
    // in a this.nodes object, so in this case we
    // can call this.nodes.searchInput and it'll be the node
    //
    // this.nodes should be populated as soon as the component
    // is mounted
    return React.findDOMNode(this.refs.searchInput);
  },

  componentWillMount: function () {
    // Listen reactively to history changes
    this.handlers.history = Rx.Observable.fromHistory()
      .pluck("pathname")
      .forEach(this.debug)
  },

  componentDidMount: function () {
    // Listen reactively to DOM key up events
    this.handlers.dom = Rx.Observable.fromEvent(this.node, 'keyup')
      .pluck('target', 'value')
      .filter( text => text.length > 2 )
      .filter( text => text.keyCode != ENTER_KEY_CODE )
      .debounce(350)
      .distinctUntilChanged()
      //.flatMapLatest(this.search);
      .flatMapLatest(this.debug);
  },

  componentWillUnmount: function () {
    // unsubscribe all handlers
    // Abstract this pattern into a mixin
    this.handlers.keys( key => key() );
  },

  getInitialState: function () {
    return { query: '' };
  },

  render: function () {
    return (
      <form action="." id="search-bar">
        <span>&gt; tldr </span>
        <input
          autoComplete="off"
          autofocus="true"
          id="search"
          placeholder='command'
          ref="searchInput"
          size="10"
          type="search"
          value={this.state.query}
        />
        <GithubOctocat path="ostera/tldr.jsx"/>
      </form>
    );
  },

  search: function (query) {
    this.setState({ query: query });
    // navigate!
    this.history.pushState({ path: query });
  },

  focus: function (query) {
    let length = query.length;
    let field = this.node();
    field.focus();
    field.setSelectionRange(length, length);
  },

  debug: function () {
    console.log("debug", arguments);
  }

});
