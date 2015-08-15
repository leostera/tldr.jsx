import React from 'react';

import { UserActionCreator } from '../actions/Users';

const ENTER_KEY_CODE = 13;

export default React.createClass({

  getInitialState: function () {
    return {query: ''};
  },

  render: function () {
    return (
        <div>
          <input placeholder='ostera'
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
      UserActionCreator.search(query);
      this.setState({query: ''});
    }
  }

});
