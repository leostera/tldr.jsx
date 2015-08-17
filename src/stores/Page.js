import EventEmitter from 'events';
import assign from 'object-assign';
import co from 'co';
import request from 'axios';
import { decode } from 'base-64';

import Dispatcher from '../dispatchers/Main';
import { ActionTypes } from '../actions/Page';

// Internal data structure for pages
const BASE_URL = "https://api.github.com/repos/tldr-pages/tldr/contents/pages";
let _currentPage = '';

let PageStore = assign( {}, EventEmitter.prototype, {

  emitLoad: function () {
    this.emit("load");
  },

  addLoadListener: function(callback) {
    this.on("load", callback);
  },

  removeLoadListener: function(callback) {
    this.removeListener("load", callback);
  },

  getCurrentPage: function () { return _currentPage; },

  get: function (cmd) {
    return co(function *getIndex() {
      let url = [BASE_URL, cmd.platform[0], cmd.name+'.md'].join('/')
      let requestOptions = {
        method: 'GET',
        url,
        withCredentials: false
      };
      let rawIndex = yield request(requestOptions);
      let body = decode(rawIndex.data.content);
      return body;
    })
  }

});

PageStore.dispatchToken = Dispatcher.register(function (payload) {
  switch(payload.type) {

    case ActionTypes.PAGE_LOAD:
      PageStore
        .get(payload.cmd)
        .then( page => {
          _currentPage = page;
        } );
      PageStore.emitLoad();
    break;

    default:
      // no-op
  };
});

export default PageStore;
