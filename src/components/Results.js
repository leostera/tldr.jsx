import React from 'react';

import marked from 'marked';

marked.setOptions({
  gfm: true
});

import { Page } from '../actions/Page';

import CommandStore from '../stores/Command';
import PageStore from '../stores/Page';

export default React.createClass({

  componentDidMount: function () {
    CommandStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    CommandStore.removeChangeListener(this._onChange);
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

  _onChange: function () {
    let cmd = CommandStore.getCurrentCommand().pop();
    PageStore.get(cmd).then( page => {
      this.setState({ body: page });
    });
  }

});
