import React from 'react';
import Rx from 'rx';

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

  __componentDidMount: function () {
    this.handlers.history = Rx.history
      .pluck('path')
      .distinctUntilChanged()
      .flatMapLatest(this.fetch);
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

  fetch: function (cmd) {
    Command
     .search(cmd)
     .limit(1)
     .flatMapLatest( this.display );
  },

  display: function (page) {
    Page
      .get(cmd)
      .flatMapLatest( page => {
        if (page) {
          this.setState({ body: page });
        } else {
          console.log(page+" not found");
        }
      });
  }

});
