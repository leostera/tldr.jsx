import React from 'react';

import CmdStore from '../stores/Cmd';

export default React.createClass({

  getInitialState: function () {
    return { };
  },

  componentDidMount: function () {
    CmdStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    CmdStore.removeChangeListener(this._onChange);
  },

  render: function () {
    return (
        <div> { content } </div>
      );
  },

  _onChange: function () {
    this.setState(CmdStore.getCurrentPage());
  }

});
