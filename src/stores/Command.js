import EventEmitter from 'events';

import co from 'co';
import assign from 'object-assign';
import request from 'request-promise';

import Dispatcher from '../dispatchers/Main';
import { ActionTypes } from '../actions/Command';

// Internal data structure for users
const INDEX_URL = "https://api.github.com/repos/tldr-pages/tldr/contents/pages/index.json";
let _commands = {};
let _currentCommand = {};

let CommandStore = assign( {}, EventEmitter.prototype, {

  emitChange: function () {
    this.emit("change");
  },

  addChangeListener: function(callback) {
    this.on("change", callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener("change", callback);
  },

  getCurrentCommand: function () { return _currentCommand; },
  getCommands: function () { return _commands; }

});

CommandStore.dispatchToken = Dispatcher.register(function (action) {
  switch(action.type) {

    case ActionTypes.CMD_SEARCH:
      // look command up in cache
      // set _currentCommand
      CommandStore.emitChange();      
    break;

    case ActionTypes.CMD_LOAD_INDEX:
      async function getIndex() {
        let rawIndex = await request.get(INDEX_URL);
        return JSON.parse(rawIndex);
      }
      _commands = getIndex();
    break;

    default:
      // no-op
  };
});

export default CommandStore;
