import React from 'react';

import marked from 'marked';

import { Page } from '../actions/Page';

import CommandStore from '../stores/Command';
import PageStore from '../stores/Page';

import EmptyResults from './EmptyResults';

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
    let results = markup ? <span dangerouslySetInnerHTML={{__html: markup }} /> : <EmptyResults />
    return (
      <div id="page">
        {results}
      </div>
    );
  },

  _onChange: function () {
    let cmd = CommandStore.getCurrentCommand().pop();
    PageStore.get(cmd).then( page => {
      this.setState({ body: page });
    }).catch( err => {
      this.setState({ body: '' });
    });
  }

});
