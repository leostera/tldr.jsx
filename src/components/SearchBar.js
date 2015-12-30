import React from 'react';

import { Command } from '../actions/Command';
import CommandStore from '../stores/Command';

const ENTER_KEY_CODE = 13;

export default React.createClass({

  componentWillMount: function () {
    Command.loadIndex();
  },

  getInitialState: function () {
    return {query: ''};
  },

  render: function () {
    return (
      <div>
        <span>&gt; tldr </span>
        <input placeholder='command'
          autofocus
          autocomplete="off"
          onChange={this._handleChange}
          onKeyDown={this._handleEnter}
        />
      </div>
    );
  },

  _handleChange: function (event) {
    this.setState({query: event.target.value});
  },

  _handleEnter: function (event) {
    const query = this.state.query.trim();
    if (event.keyCode === ENTER_KEY_CODE && query) {
      event.preventDefault();
      Command.search(query.toLowerCase());
      this.setState({query: ''});
    }
  }

});
