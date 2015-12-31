import React from 'react';
import { History } from 'react-router';

import { Command } from '../actions/Command';
import CommandStore from '../stores/Command';

const ENTER_KEY_CODE = 13;

export default React.createClass({
  mixins: [History],

  componentWillMount: function () {
    Command.loadIndex();
  },

  componentDidMount: function () {
    this.history.listen( (oldState, newState) => {
      let query = newState.params.splat;
      this.setQuery(query);
      this.focusSearch();
      setTimeout( () => { Command.search(query); }, 100);
    }.bind(this) );
  },

  getInitialState: function () {
    return { query: '' };
  },

  render: function () {
    return (
      <form action="." id="search-bar">
        <span>&gt; tldr </span>
        <input
          autocomplete="off"
          autofocus="true"
          id="search"
          onChange={this._handleChange}
          onKeyDown={this._handleEnter}
          placeholder='command'
          ref="searchInput"
          size="15"
          type="search"
          value={this.state.query}
        />
      </form>
    );
  },

  _handleChange: function (event) {
    this.setQuery(event.target.value);
  },

  _handleEnter: function (event) {
    const query = this.cleanQuery(this.state.query);
    if (event.keyCode === ENTER_KEY_CODE && query) {
      event.preventDefault();
      this.history.push({ pathname: query });
    }
  },

  cleanQuery: function (query) {
    return query.trim().toLowerCase();
  },

  setQuery: function (query) {
    this.setState({
      query: this.cleanQuery(query)
    });
  },

  focusSearch: function () {
    let length = this.state.query.length;
    let field = React.findDOMNode(this.refs.searchInput)
    field.focus();
    field.setSelectionRange(length, length);
  }

});
